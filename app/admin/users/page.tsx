'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export default function AdminUsers(){
    // State management for the component
    const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // Ref to prevent duplicate API calls in React Strict Mode
    const hasFetched = useRef(false);
    
    // Get current user authentication
    const { firebaseUser } = useAuth();

    // Function to fetch all role requests from Firebase - memoized to prevent unnecessary re-renders
    const fetchRoleRequests = useCallback(async () => {
        if (!firebaseUser) {
            console.log('Admin Users: No firebaseUser, skipping fetch');
            return;
        }
        
        console.log('Admin Users: Starting to fetch role requests');
        setLoading(true);
        setError('');
        
        try {
            const requests: RoleRequest[] = [];
            
            // Get all users to check their request subcollections
            const usersSnapshot = await getDocs(collection(db, 'users'));
            console.log(`Admin Users: Found ${usersSnapshot.docs.length} users to check`);
            
            // Loop through each user and check for role requests
            for (const userDoc of usersSnapshot.docs) {
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
                    console.log(`Skipping user ${userDoc.id} - no requests found`);
                }
            }
            
            // Sort requests by creation date (newest first)
            requests.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            
            console.log(`Admin Users: Found ${requests.length} pending role requests`);
            setRoleRequests(requests);
            
        } catch (error: any) {
            console.error('Error fetching role requests:', error);
            setError('Failed to load role requests. Please try again.');
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
            console.log('Admin Users Page: Calling fetchRoleRequests (first time)');
            hasFetched.current = true;
            fetchRoleRequests();
        } else if (firebaseUser && hasFetched.current) {
            console.log('Admin Users Page: Already fetched, skipping duplicate call');
        } else if (!firebaseUser) {
            console.log('Admin Users Page: No firebaseUser, setting loading to false');
            hasFetched.current = false; // Reset for next user login
            setLoading(false);
        }
    }, [firebaseUser, fetchRoleRequests]); // Include fetchRoleRequests since it's memoized

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

            {/* Role Requests Section */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Role Upgrade Requests</h2>
                    <button 
                        onClick={() => {
                            hasFetched.current = false; // Reset to allow manual refresh
                            fetchRoleRequests();
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
                
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading requests...</span>
                        </div>
                    ) : roleRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                            <p className="text-gray-600">All role upgrade requests have been processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {roleRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                    {/* Request Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {request.userName}
                                            </h3>
                                            <p className="text-gray-600">{request.userEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pending Review
                                            </span>
                                        </div>
                                    </div>

                                    {/* Role Change Details */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div>
                                            <span className="text-sm text-gray-500">Current Role:</span>
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(request.currentRole)}`}>
                                                {request.currentRole}
                                            </span>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                        <div>
                                            <span className="text-sm text-gray-500">Requested Role:</span>
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(request.requestedRole)}`}>
                                                {request.requestedRole}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Request Message */}
                                    {request.message && (
                                        <div className="mb-4">
                                            <span className="text-sm font-medium text-gray-700">Request Message:</span>
                                            <p className="text-gray-600 mt-1 text-sm bg-gray-50 p-3 rounded-md">
                                                {request.message}
                                            </p>
                                        </div>
                                    )}

                                    {/* Request Timestamp */}
                                    <div className="text-sm text-gray-500 mb-4">
                                        Requested on: {formatDate(request.createdAt)}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleApproveRequest(request)}
                                            disabled={processingId === request.id}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processingId === request.id ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </span>
                                            ) : (
                                                '✅ Approve Request'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request)}
                                            disabled={processingId === request.id}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processingId === request.id ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </span>
                                            ) : (
                                                '❌ Reject Request'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Request Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{roleRequests.length}</div>
                        <div className="text-yellow-700">Pending Requests</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {roleRequests.filter(r => r.requestedRole === 'organizer').length}
                        </div>
                        <div className="text-blue-700">Organizer Requests</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {roleRequests.filter(r => r.requestedRole === 'admin').length}
                        </div>
                        <div className="text-green-700">Admin Requests</div>
                    </div>
                </div>
            </div>
        </div>
    )
}