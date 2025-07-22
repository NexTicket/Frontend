'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/auth-provider';

// Types for our role request data
interface RoleRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  currentRole: string;
  requestedRole: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: any;
  message: string;
  createdAt: string;
}

// Types for user data
interface User {
  id: string;
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: 'admin' | 'organizer' | 'customer';
  createdAt: any;
  updatedAt: any;
}

export default function AdminUsers(){
    // State management for the component
    const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userStats, setUserStats] = useState({
        total: 0,
        admins: 0,
        organizers: 0,
        customers: 0,
        newThisWeek: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
        const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'organizer' | 'customer'>('all');
    
    // Modal states
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showManageUser, setShowManageUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    // Ref to prevent duplicate API calls in React Strict Mode
    const hasFetched = useRef(false);
    
    // Get current user authentication
    const { firebaseUser } = useAuth();

    // Function to fetch all users and role requests from Firebase - memoized to prevent unnecessary re-renders
    const fetchAllData = useCallback(async () => {
        if (!firebaseUser) {
            console.log('Admin Users: No firebaseUser, skipping fetch');
            return;
        }
        
        console.log('Admin Users: Starting to fetch all user data');
        setLoading(true);
        setError('');
        
        try {
            const requests: RoleRequest[] = [];
            const users: User[] = [];
            
            // Get all users to check their request subcollections and collect user data
            const usersSnapshot = await getDocs(collection(db, 'users'));
            console.log(`Admin Users: Found ${usersSnapshot.docs.length} users to check`);
            
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            let stats = {
                total: 0,
                admins: 0,
                organizers: 0,
                customers: 0,
                newThisWeek: 0
            };
            
            // Loop through each user and collect data
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                
                // Add to users list
                const user: User = {
                    id: userDoc.id,
                    uid: userData.uid || userDoc.id,
                    email: userData.email || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    displayName: userData.displayName || '',
                    role: userData.role || 'customer',
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt
                };
                users.push(user);
                
                // Update statistics
                stats.total++;
                if (user.role === 'admin') stats.admins++;
                else if (user.role === 'organizer') stats.organizers++;
                else stats.customers++;
                
                // Check if user was created this week
                if (user.createdAt && user.createdAt.toDate) {
                    const createdDate = user.createdAt.toDate();
                    if (createdDate > oneWeekAgo) {
                        stats.newThisWeek++;
                    }
                } else if (user.createdAt) {
                    const createdDate = new Date(user.createdAt);
                    if (createdDate > oneWeekAgo) {
                        stats.newThisWeek++;
                    }
                }
                
                // Check for role requests
                try {
                    const requestDoc = await getDoc(doc(db, 'users', userDoc.id, 'requests', 'roleRequest'));
                    
                    if (requestDoc.exists()) {
                        const requestData = requestDoc.data();
                        
                        // Only include pending requests in the admin view
                        if (requestData.status === 'pending') {
                            requests.push({
                                id: userDoc.id, // Use userId as the request ID
                                userId: userDoc.id,
                                userEmail: requestData.userEmail || '',
                                userName: requestData.userName || 'Unknown User',
                                currentRole: requestData.currentRole || 'customer',
                                requestedRole: requestData.requestedRole || '',
                                status: requestData.status || 'pending',
                                requestedAt: requestData.requestedAt,
                                message: requestData.message || '',
                                createdAt: requestData.createdAt || ''
                            });
                        }
                    }
                } catch (error) {
                    // Skip users without requests or permission issues
                    console.log(`Skipping role request check for user ${userDoc.id}`);
                }
            }
            
            // Sort requests by creation date (newest first)
            requests.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            
            // Sort users by creation date (newest first)
            users.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });
            
            console.log(`Admin Users: Found ${requests.length} pending role requests and ${users.length} total users`);
            console.log('Admin Users: Sample users:', users.slice(0, 3));
            setRoleRequests(requests);
            setAllUsers(users);
            setUserStats(stats);
            
        } catch (error: any) {
            console.error('Error fetching user data:', error);
            setError('Failed to load user data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [firebaseUser]); // Only re-create function when firebaseUser changes

    // Function to approve a role request
    const handleApproveRequest = async (request: RoleRequest) => {
        setProcessingId(request.id);
        
        try {
            // Update the user's role in their main profile
            await updateDoc(doc(db, 'users', request.userId), {
                role: request.requestedRole
            });
            
            // Update the request status to approved
            await updateDoc(doc(db, 'users', request.userId, 'requests', 'roleRequest'), {
                status: 'approved',
                approvedAt: new Date().toISOString(),
                approvedBy: firebaseUser?.uid
            });
            
            // Remove from the pending list
            setRoleRequests(prev => prev.filter(req => req.id !== request.id));
            
            console.log(`Approved role request for ${request.userEmail}`);
            
        } catch (error: any) {
            console.error('Error approving request:', error);
            setError('Failed to approve request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Function to reject a role request
    const handleRejectRequest = async (request: RoleRequest) => {
        setProcessingId(request.id);
        
        try {
            // Update the request status to rejected
            await updateDoc(doc(db, 'users', request.userId, 'requests', 'roleRequest'), {
                status: 'rejected',
                rejectedAt: new Date().toISOString(),
                rejectedBy: firebaseUser?.uid
            });
            
            // Remove from the pending list
            setRoleRequests(prev => prev.filter(req => req.id !== request.id));
            
            console.log(`Rejected role request for ${request.userEmail}`);
            
        } catch (error: any) {
            console.error('Error rejecting request:', error);
            setError('Failed to reject request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Load role requests when component mounts or user changes
    useEffect(() => {
        console.log('Admin Users Page: useEffect triggered');
        console.log('Admin Users Page: firebaseUser:', firebaseUser ? 'exists' : 'null');
        console.log('Admin Users Page: hasFetched.current:', hasFetched.current);
        
        if (firebaseUser && !hasFetched.current) {
            console.log('Admin Users Page: Calling fetchAllData (first time)');
            hasFetched.current = true;
            fetchAllData();
        } else if (firebaseUser && hasFetched.current) {
            console.log('Admin Users Page: Already fetched, skipping duplicate call');
        } else if (!firebaseUser) {
            console.log('Admin Users Page: No firebaseUser, setting loading to false');
            hasFetched.current = false; // Reset for next user login
            setLoading(false);
        }
    }, [firebaseUser, fetchAllData]); // Include fetchAllData since it's memoized

    // Filter users based on search term and role filter
    const filteredUsers = useMemo(() => {
        console.log('Filtering users:', { allUsers: allUsers.length, searchTerm, roleFilter });
        if (!allUsers) return [];
        
        const filtered = allUsers.filter(user => {
            const matchesSearch = !searchTerm || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = roleFilter === 'all' || !roleFilter || user.role === roleFilter;
            
            return matchesSearch && matchesRole;
        });
        
        console.log('Filtered users result:', filtered.length);
        return filtered;
    }, [allUsers, searchTerm, roleFilter]);

    // Helper function to format dates
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Helper function to get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'organizer': return 'bg-blue-100 text-blue-800';
            case 'customer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Toggle request expansion
    const toggleRequestExpansion = (requestId: string) => {
        const newExpanded = new Set(expandedRequests);
        if (newExpanded.has(requestId)) {
            newExpanded.delete(requestId);
        } else {
            newExpanded.add(requestId);
        }
        setExpandedRequests(newExpanded);
    };

    // Handle view user details
    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setShowUserDetails(true);
    };

    // Handle manage user
    const handleManageUser = (user: User) => {
        setSelectedUser(user);
        setShowManageUser(true);
    };

    // Handle role change
    const handleRoleChange = async (newRole: 'admin' | 'organizer' | 'customer') => {
        if (!selectedUser) return;
        
        setProcessingId(selectedUser.id);
        
        try {
            await updateDoc(doc(db, 'users', selectedUser.id), {
                role: newRole,
                updatedAt: new Date()
            });
            
            // Update local state
            setAllUsers(prev => prev.map(user => 
                user.id === selectedUser.id 
                    ? { ...user, role: newRole, updatedAt: new Date() }
                    : user
            ));
            
            // Update stats
            setUserStats(prev => {
                const newStats = { ...prev };
                // Decrease old role count
                if (selectedUser.role === 'admin') newStats.admins--;
                else if (selectedUser.role === 'organizer') newStats.organizers--;
                else newStats.customers--;
                
                // Increase new role count
                if (newRole === 'admin') newStats.admins++;
                else if (newRole === 'organizer') newStats.organizers++;
                else newStats.customers++;
                
                return newStats;
            });
            
            setSelectedUser({ ...selectedUser, role: newRole });
            
        } catch (error: any) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle account suspension
    const handleSuspendUser = async () => {
        if (!selectedUser) return;
        
        setProcessingId(selectedUser.id);
        
        try {
            await updateDoc(doc(db, 'users', selectedUser.id), {
                suspended: true,
                suspendedAt: new Date(),
                suspendedBy: firebaseUser?.uid
            });
            
            console.log(`Suspended user: ${selectedUser.email}`);
            setShowManageUser(false);
            
        } catch (error: any) {
            console.error('Error suspending user:', error);
            setError('Failed to suspend user. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };
    

    return(
        <div className="p-6 space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage role upgrade requests and user permissions</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                    <button 
                        onClick={() => setError('')}
                        className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
                
                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.admins}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organizers</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.organizers}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.newThisWeek}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'requests'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        Role Requests ({roleRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'users'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        All Users ({allUsers.length})
                    </button>
                </div>
                
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        {activeTab === 'users' && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'organizer' | 'customer')}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="organizer">Organizer</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={() => {
                            hasFetched.current = false; // Reset to allow manual refresh
                            fetchAllData();
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'requests' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Role Upgrade Requests</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage pending role change requests from users
                        </p>
                    </div>
                    
                    <div className="p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading requests...</span>
                            </div>
                        ) : roleRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-6xl mb-4">📝</div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Requests</h3>
                                <p className="text-gray-600 dark:text-gray-400">All role upgrade requests have been processed.</p>
                            </div>
                        ) : (
                        <div className="space-y-3">
                            {roleRequests.map((request) => (
                                <div 
                                    key={request.id} 
                                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                >
                                    {/* Main Horizontal Panel */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            {/* User Info Section */}
                                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                    {request.userName.charAt(0).toUpperCase()}
                                                </div>
                                                
                                                {/* User Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {request.userName}
                                                        </h3>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            Pending
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">{request.userEmail}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(request.currentRole)}`}>
                                                            {request.currentRole}
                                                        </span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(request.requestedRole)}`}>
                                                            {request.requestedRole}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions Section */}
                                            <div className="flex items-center space-x-3">
                                                {/* Approve Button */}
                                                <button
                                                    onClick={() => handleApproveRequest(request)}
                                                    disabled={processingId === request.id}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                                >
                                                    {processingId === request.id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Approve
                                                        </>
                                                    )}
                                                </button>

                                                {/* Reject Button */}
                                                <button
                                                    onClick={() => handleRejectRequest(request)}
                                                    disabled={processingId === request.id}
                                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                                >
                                                    {processingId === request.id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Reject
                                                        </>
                                                    )}
                                                </button>

                                                {/* Expand/Collapse Button */}
                                                <button
                                                    onClick={() => toggleRequestExpansion(request.id)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                                >
                                                    <svg 
                                                        className={`w-5 h-5 transform transition-transform duration-300 ${
                                                            expandedRequests.has(request.id) ? 'rotate-180' : ''
                                                        }`} 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Details Section */}
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            expandedRequests.has(request.id) 
                                                ? 'max-h-96 opacity-100' 
                                                : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-4 pb-4 border-t bg-gray-50/50">
                                            <div className="pt-4 space-y-4">
                                                {/* Request Message */}
                                                {request.message && (
                                                    <div className="bg-white rounded-lg p-4 border">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            Request Message
                                                        </h4>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {request.message}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Additional Details Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Request Timeline */}
                                                    <div className="bg-white rounded-lg p-4 border">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Request Timeline
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Submitted:</span>
                                                                <span className="font-medium">{formatDate(request.createdAt)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Status:</span>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    {request.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Role Change Summary */}
                                                    <div className="bg-white rounded-lg p-4 border">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Role Change Summary
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">From:</span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(request.currentRole)}`}>
                                                                    {request.currentRole}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">To:</span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(request.requestedRole)}`}>
                                                                    {request.requestedRole}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Users</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage all registered users in the system
                        </p>
                    </div>
                    
                    <div className="p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading users...</span>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-6xl mb-4">👥</div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Found</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {searchTerm || roleFilter ? 'No users match your current filters.' : 'No users have registered yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsers.map((user: User) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                                                                     user.firstName ? user.firstName.charAt(0).toUpperCase() : 
                                                                     user.email.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'No Name'}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        user.role === 'organizer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}>
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {user.createdAt ? formatDate(
                                                        user.createdAt.toDate ? user.createdAt.toDate().toISOString() : user.createdAt.toString()
                                                    ) : 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleViewDetails(user)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors mr-2"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </button>
                                                    <button 
                                                        onClick={() => handleManageUser(user)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">
                                            {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 
                                             selectedUser.firstName ? selectedUser.firstName.charAt(0).toUpperCase() : 
                                             selectedUser.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">User Details</h3>
                                        <p className="text-blue-100">Complete user information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowUserDetails(false)}
                                    className="text-white hover:text-blue-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Display Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {selectedUser.displayName || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">First Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {selectedUser.firstName || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {selectedUser.lastName || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Account Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">User ID</label>
                                        <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedUser.uid}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</label>
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                            selectedUser.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            selectedUser.role === 'organizer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}>
                                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {selectedUser.createdAt ? formatDate(
                                                selectedUser.createdAt.toDate ? selectedUser.createdAt.toDate().toISOString() : selectedUser.createdAt.toString()
                                            ) : 'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {selectedUser.updatedAt ? formatDate(
                                                selectedUser.updatedAt.toDate ? selectedUser.updatedAt.toDate().toISOString() : selectedUser.updatedAt.toString()
                                            ) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowUserDetails(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUserDetails(false);
                                        handleManageUser(selectedUser);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Manage User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Management Modal */}
            {showManageUser && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-600 to-red-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Manage User</h3>
                                        <p className="text-orange-100 text-sm">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowManageUser(false)}
                                    className="text-white hover:text-orange-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Role Management */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Change User Role
                                </h4>
                                <div className="space-y-3">
                                    {(['customer', 'organizer', 'admin'] as const).map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleChange(role)}
                                            disabled={selectedUser.role === role || processingId === selectedUser.id}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                                selectedUser.role === role
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-not-allowed'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        role === 'admin' ? 'bg-green-100 text-green-800' :
                                                        role === 'organizer' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </span>
                                                    {selectedUser.role === role && (
                                                        <span className="ml-2 text-sm text-green-600 font-medium">Current Role</span>
                                                    )}
                                                </div>
                                                {processingId === selectedUser.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                ) : selectedUser.role === role ? (
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Account Actions
                                </h4>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleSuspendUser}
                                        disabled={processingId === selectedUser.id}
                                        className="w-full p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-red-800 dark:text-red-200 font-medium">Suspend Account</span>
                                                <p className="text-red-600 dark:text-red-400 text-sm">Temporarily disable user access</p>
                                            </div>
                                            {processingId === selectedUser.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowManageUser(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowManageUser(false);
                                        handleViewDetails(selectedUser);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}