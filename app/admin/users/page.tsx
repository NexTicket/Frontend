'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/auth-provider';
import { createTenant, setUserClaims, bootstrapAdmin } from '@/lib/api';
import { debugApprovalWorkflow } from '@/utils/debug-approval';
import { 
  Users, 
  Shield, 
  Crown, 
  Building, 
  UserPlus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye,
  MoreVertical,
  Clock,
  ChevronDown,
  Star,
  AlertCircle,
  Trash2,
  Edit3,
  Calendar,
  Mail,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  role: 'admin' | 'organizer' | 'customer' | 'venue_owner' | 'event_admin' | 'checkin_officer';
  createdAt: any;
  updatedAt: any;
  tenantId?: string;
  staffProfile?: {
    isAvailable: boolean;
    assignedEvents: string[];
    specializations: string[];
    createdAt: string;
  };
}

export default function AdminUsers() {
    // State management for the component
    const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userStats, setUserStats] = useState({
        total: 0,
        admins: 0,
        organizers: 0,
        venue_owners: 0,
        customers: 0,
        event_admins: 0,
        checkin_officers: 0,
        newThisWeek: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'organizer' | 'customer' | 'venue_owner' | 'event_admin' | 'checkin_officer'>('all');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    // Ref to prevent duplicate API calls in React Strict Mode
    const hasFetched = useRef(false);
    
    // Get current user authentication
    const { firebaseUser, refreshUserToken } = useAuth();

    // Function to fetch all users and role requests from Firebase - memoized to prevent unnecessary re-renders
    const fetchAllData = useCallback(async () => {
        if (!firebaseUser) {
            console.log('Admin Users: No firebaseUser, skipping fetch');
            return;
        }
        
        console.log('Admin Users: Starting to fetch all user data');
        console.log('Admin Users: Firebase User:', firebaseUser?.email);
        console.log('Admin Users: Firebase User UID:', firebaseUser?.uid);
        setLoading(true);
        setError('');
        
        try {
            const requests: RoleRequest[] = [];
            const users: User[] = [];
            
            // Test connection first
            console.log('Admin Users: Testing Firebase connection...');
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
                venue_owners: 0,
                event_admins: 0,
                checkin_officers: 0,
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
                else if (user.role === 'venue_owner') stats.venue_owners++;
                else if (user.role === 'event_admin') stats.event_admins++;
                else if (user.role === 'checkin_officer') stats.checkin_officers++;
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
            setRoleRequests(requests);
            setAllUsers(users);
            setUserStats(stats);
            
        } catch (error: any) {
            console.error('Error fetching user data:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Provide more specific error messages based on error type
            if (error.code === 'permission-denied') {
                setError('Permission denied. Please ensure you have admin privileges and Firebase security rules allow access.');
            } else if (error.code === 'unavailable') {
                setError('Firebase service is currently unavailable. Please try again later.');
            } else if (error.message?.includes('network')) {
                setError('Network error. Please check your internet connection and try again.');
            } else {
                setError(`Failed to load user data: ${error.message || 'Unknown error'}. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    }, [firebaseUser]); // Only re-create function when firebaseUser changes

    // Function to approve a role request
    const handleApproveRequest = async (request: RoleRequest) => {
        setProcessingId(request.id);
        
        try {
            console.log(`🎯 Processing approval for ${request.userEmail}: ${request.currentRole} → ${request.requestedRole}`);
            
            // 1. Update the user's role in their main Firebase profile
            console.log('📝 Step 1: Updating Firebase user role...');
            await updateDoc(doc(db, 'users', request.userId), {
                role: request.requestedRole
            });
            
            // 2. Update the request status to approved in Firebase
            console.log('📝 Step 2: Marking request as approved...');
            await updateDoc(doc(db, 'users', request.userId, 'requests', 'roleRequest'), {
                status: 'approved',
                approvedAt: new Date().toISOString(),
                approvedBy: firebaseUser?.uid
            });
            console.log('✅ Step 2 complete: Request marked as approved');

            // 3. Set custom claims via API call to backend
            console.log('📝 Step 3: Setting Firebase custom claims...');
            try {
                await setUserClaims(request.userId, {
                    role: request.requestedRole,
                });
                console.log(`✅ Step 3 complete: Firebase custom claims set: ${request.userId} → ${request.requestedRole}`);
            } catch (claimsError: any) {
                console.error('❌ Step 3 failed: Custom claims error:', claimsError);
                // Continue with tenant creation even if claims fail
                console.warn('⚠️ Continuing with tenant creation despite claims failure');
            }

            // 4. Handle role-specific setup
            if (request.requestedRole === 'venue_owner' || request.requestedRole === 'organizer') {
                // Create tenant in PostgreSQL database for venue_owner or organizer roles
                console.log(`📝 Step 4: Creating tenant in PostgreSQL for ${request.requestedRole}: ${request.userEmail}`);
                
                try {
                    const tenantData = {
                        firebaseUid: request.userId,
                        name: request.userName || 'Unnamed User',
                        email: request.userEmail,
                        role: request.requestedRole
                    };
                    
                    console.log('📤 Sending tenant data:', tenantData);
                    const tenantResponse = await createTenant(tenantData);
                    console.log(`✅ Step 4 complete: Tenant created successfully:`, tenantResponse);
                    
                    // 5. Add tenantId to Firebase user profile
                    if (tenantResponse.data && tenantResponse.data.id) {
                        console.log('📝 Step 5: Adding tenantId to Firebase user profile...');
                        await updateDoc(doc(db, 'users', request.userId), {
                            tenantId: tenantResponse.data.id
                        });
                        console.log(`✅ Step 5 complete: TenantId ${tenantResponse.data.id} added to Firebase user profile`);
                    }
                    
                } catch (tenantError: any) {
                    console.error('❌ Step 4/5 failed: Tenant creation error:', tenantError);
                    console.error('❌ Tenant error details:', {
                        message: tenantError.message,
                        stack: tenantError.stack
                    });
                    // Don't fail the whole approval process if tenant creation fails
                    // The user role was already updated in Firebase
                    console.warn('⚠️ User role approved in Firebase, but tenant creation failed. Manual tenant creation may be required.');
                }
            } else if (request.requestedRole === 'event_admin' || request.requestedRole === 'checkin_officer') {
                // Setup for event staff roles
                console.log(`📝 Step 4: Setting up ${request.requestedRole} profile for ${request.userEmail}`);
                
                try {
                    // Add staff-specific fields to user profile
                    await updateDoc(doc(db, 'users', request.userId), {
                        role: request.requestedRole,
                        staffProfile: {
                            isAvailable: true,
                            assignedEvents: [],
                            createdAt: new Date().toISOString(),
                            specializations: request.requestedRole === 'event_admin' ? ['general'] : ['check_in']
                        }
                    });
                    console.log(`✅ Step 4 complete: ${request.requestedRole} profile created`);
                } catch (staffError: any) {
                    console.error('❌ Step 4 failed: Staff profile creation error:', staffError);
                    console.warn('⚠️ User role approved, but staff profile creation failed.');
                }
            }
            
            // Remove from the pending list
            // 6. Remove from the pending list in UI
            console.log('📝 Step 6: Updating UI...');
            setRoleRequests(prev => prev.filter(req => req.id !== request.id));
            
            // 7. Show success message with token refresh instructions
            const successMsg = `✅ Successfully approved ${request.requestedRole} role for ${request.userEmail}${request.requestedRole === 'venue_owner' || request.requestedRole === 'organizer' ? ' and created tenant account' : ''}. User will need to refresh their page or re-login to see role changes.`;
            setSuccessMessage(successMsg);
            setTimeout(() => setSuccessMessage(''), 8000); // Clear after 8 seconds
            
            console.log(`🎉 Approval workflow completed successfully for ${request.userEmail}`);
            
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

    // Bootstrap admin function (for initial setup)
    const handleBootstrapAdmin = async () => {
        if (!firebaseUser) {
            setError('No user logged in');
            return;
        }

        setProcessingId('bootstrap-admin');
        
        try {
            console.log(`🔧 Step 1: Bootstrapping admin role for ${firebaseUser.email}...`);
            
            // Step 1: Set admin role via backend
            await bootstrapAdmin(firebaseUser.uid, firebaseUser.email || '');
            console.log(`✅ Step 1: Admin role set in backend`);
            
            // Step 2: Force refresh the Firebase ID token to get updated custom claims
            console.log(`🔄 Step 2: Forcing token refresh to get updated custom claims...`);
            const freshToken = await firebaseUser.getIdToken(true); // true = force refresh
            console.log(`✅ Step 2: Fresh token obtained, length: ${freshToken.length}`);
            
            // Step 3: Verify the token now has admin role (optional debug)
            console.log(`🔍 Step 3: Token should now include admin role`);
            
            // Step 4: Also refresh the auth provider's token
            console.log(`🔄 Step 4: Refreshing auth provider token...`);
            try {
                await refreshUserToken();
                console.log(`✅ Step 4: Auth provider token refreshed`);
            } catch (refreshError) {
                console.warn('⚠️ Auth provider refresh failed, but admin role should still work:', refreshError);
            }
            
            setSuccessMessage(`✅ Admin role successfully set for ${firebaseUser.email}! Custom claims updated and token refreshed.`);
            
            // Wait a moment for everything to propagate, then reload
            setTimeout(() => {
                console.log('🔄 Reloading page with fresh admin token...');
                window.location.reload();
            }, 1000);
            
        } catch (error: any) {
            console.error('❌ Error bootstrapping admin:', error);
            setError(`Failed to bootstrap admin: ${error.message}`);
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
        if (!allUsers) return [];
        
        return allUsers.filter(user => {
            const matchesSearch = !searchTerm || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            
            return matchesSearch && matchesRole;
        });
    }, [allUsers, searchTerm, roleFilter]);

    // Helper function to format dates
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Helper function to get role icon
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4" />;
            case 'organizer': return <Crown className="w-4 h-4" />;
            case 'venue_owner': return <Building className="w-4 h-4" />;
            case 'event_admin': return <Star className="w-4 h-4" />;
            case 'checkin_officer': return <UserCheck className="w-4 h-4" />;
            case 'customer': return <Users className="w-4 h-4" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    // Get role display name
    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'venue_owner': return 'Venue Owner';
            case 'event_admin': return 'Event Admin';
            case 'checkin_officer': return 'Check-in Officer';
            case 'organizer': return 'Organizer';
            case 'admin': return 'Admin';
            case 'customer': return 'Customer';
            default: return role.charAt(0).toUpperCase() + role.slice(1);
        }
    };

    // Handle user actions
    const handleUserAction = (user: User, action: string) => {
        switch (action) {
            case 'view':
                setSelectedUser(user);
                break;
            case 'edit':
                // TODO: Implement edit functionality
                console.log('Edit user:', user);
                break;
            case 'delete':
                // TODO: Implement delete functionality
                console.log('Delete user:', user);
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="text-white">
                        <h1 className="text-4xl font-bold mb-2">User Management</h1>
                        <p className="text-purple-100 text-lg">Manage users, roles, and permissions across your platform</p>
                    </div>
                    
                    {/* Quick Stats in Header */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.total}</div>
                            <div className="text-sm text-purple-100">Total Users</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{roleRequests.length}</div>
                            <div className="text-sm text-purple-100">Pending Requests</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.admins}</div>
                            <div className="text-sm text-purple-100">Admins</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.organizers}</div>
                            <div className="text-sm text-purple-100">Organizers</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.venue_owners}</div>
                            <div className="text-sm text-purple-100">Venue Owners</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.event_admins}</div>
                            <div className="text-sm text-purple-100">Event Admins</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.checkin_officers}</div>
                            <div className="text-sm text-purple-100">Check-in Officers</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{userStats.newThisWeek}</div>
                            <div className="text-sm text-purple-100">New This Week</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Error and Success Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Success</h3>
                                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bootstrap Admin Card */}
                {firebaseUser && (
                    <div className="mb-6 bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Admin Setup</h3>
                                    <p className="text-sm text-gray-600">
                                        Set admin role for {firebaseUser.email} if getting permission errors
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleBootstrapAdmin}
                                disabled={processingId === 'bootstrap-admin'}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {processingId === 'bootstrap-admin' ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Setting...
                                    </div>
                                ) : (
                                    'Set Admin Role'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Role Requests</p>
                                <p className="text-3xl font-bold text-purple-600">{roleRequests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                                <p className="text-3xl font-bold text-green-600">{userStats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Staff Members</p>
                                <p className="text-3xl font-bold text-blue-600">{userStats.admins + userStats.organizers}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">New This Week</p>
                                <p className="text-3xl font-bold text-orange-600">{userStats.newThisWeek}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl p-2 shadow-lg mb-8 inline-flex">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            activeTab === 'requests'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Role Requests ({roleRequests.length})</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            activeTab === 'users'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>All Users ({allUsers.length})</span>
                        </div>
                    </button>
                </div>

                {/* Search and Filters */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div className="relative">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="venue_owner">Venue Owner</option>
                                        <option value="event_admin">Event Admin</option>
                                        <option value="checkin_officer">Check-in Officer</option>
                                        <option value="customer">Customer</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Filter className="w-4 h-4" />
                                    <span>Showing {filteredUsers.length} users</span>
                                </div>
                                
                                <Button
                                    onClick={() => {
                                        hasFetched.current = false;
                                        fetchAllData();
                                    }}
                                    disabled={loading}
                                    variant="outline"
                                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Loading...
                                        </div>
                                    ) : (
                                        'Refresh'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
                        <p className="text-gray-600">Fetching user data and role requests</p>
                    </div>
                ) : activeTab === 'requests' ? (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Role Upgrade Requests</h2>
                            <p className="text-sm text-gray-600 mt-1">Review and approve role change requests from users</p>
                        </div>
                        
                        {roleRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                                <p className="text-gray-600">All role requests have been processed</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {roleRequests.map((request) => (
                                    <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                    <UserPlus className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {request.userName}
                                                        </h3>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                                {getRoleIcon(request.currentRole)}
                                                                <span className="ml-1">{getRoleDisplayName(request.currentRole)}</span>
                                                            </span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                                                {getRoleIcon(request.requestedRole)}
                                                                <span className="ml-1">{getRoleDisplayName(request.requestedRole)}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            {request.userEmail}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {formatDate(request.createdAt)}
                                                        </div>
                                                    </div>
                                                    {request.message && (
                                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                            <p className="text-sm text-gray-700">{request.message}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 ml-4">
                                                <Button
                                                    onClick={() => handleApproveRequest(request)}
                                                    disabled={processingId === request.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    {processingId === request.id ? (
                                                        <div className="flex items-center">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Processing...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </div>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => handleRejectRequest(request)}
                                                    disabled={processingId === request.id}
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage all registered users in the system</p>
                        </div>
                        
                        {filteredUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                                <p className="text-gray-600">
                                    {searchTerm || roleFilter !== 'all' ? 'No users match your current filters.' : 'No users have registered yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-semibold">
                                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                                                     user.firstName ? user.firstName.charAt(0).toUpperCase() : 
                                                     user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'No Name'}
                                                        </h3>
                                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                            user.role === 'organizer' ? 'bg-purple-100 text-purple-800' :
                                                            user.role === 'venue_owner' ? 'bg-blue-100 text-blue-800' :
                                                            user.role === 'event_admin' ? 'bg-orange-100 text-orange-800' :
                                                            user.role === 'checkin_officer' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {getRoleIcon(user.role)}
                                                            <span className="ml-1">{getRoleDisplayName(user.role)}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            {user.email}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {user.createdAt ? formatDate(
                                                                user.createdAt.toDate ? user.createdAt.toDate().toISOString() : user.createdAt.toString()
                                                            ) : 'Unknown'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => handleUserAction(user, 'view')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    onClick={() => handleUserAction(user, 'edit')}
                                                    variant="outline" 
                                                    size="sm"
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit3 className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <div className="relative">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-600 hover:bg-gray-50 p-2"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Debug Info - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <strong>Debug Info:</strong> User: {firebaseUser?.email || 'Not authenticated'} | 
                                Loading: {loading ? 'Yes' : 'No'} | 
                                Requests: {roleRequests.length} | 
                                Users: {allUsers.length}
                            </div>
                            <Button
                                onClick={async () => {
                                    console.log('🧪 Running debug workflow test...');
                                    const results = await debugApprovalWorkflow.runCompleteTest();
                                    console.log('🎯 Debug test complete:', results);
                                    alert('Debug test complete - check console for results');
                                }}
                                variant="outline"
                                size="sm"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                🧪 Test Workflow
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
