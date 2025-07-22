"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  Download,
  Share2,
  Star,
  Settings,
  Heart,
  History,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { mockEvents, mockTickets } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { setDoc, doc, serverTimestamp, getDoc, collection } from 'firebase/firestore';

export default function ProfilePage() {
  const { userProfile, firebaseUser, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tickets');
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  //if (!userProfile) return null; // loading fallback

  const isCustomer = userProfile?.role === 'customer';
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
  }, [isLoading, firebaseUser, router]);

  // Check for existing role requests
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (firebaseUser && isCustomer) {
        try {
          // Only check user's own subcollection to avoid permission issues
          const userRequestDoc = await getDoc(doc(db, 'users', firebaseUser.uid, 'requests', 'roleRequest'));
          if (userRequestDoc.exists() && userRequestDoc.data()?.status === 'pending') {
            setHasExistingRequest(true);
          } else {
            setHasExistingRequest(false);
          }
        } catch (error: any) {
          // Silently handle permission errors - this is expected for new users
          if (error?.code !== 'permission-denied') {
            console.log('Error checking requests:', error.message);
          }
          setHasExistingRequest(false);
        }
      }
    };

    if (firebaseUser && isCustomer) {
      checkExistingRequest();
    }
  }, [firebaseUser, isCustomer]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRoleRequest = async () => {
    if (!firebaseUser || !selectedRole) return;

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const requestData = {
        userId: firebaseUser.uid,
        userEmail: userProfile?.email || firebaseUser.email,
        userName: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.displayName || 'User',
        currentRole: userProfile?.role || 'customer',
        requestedRole: selectedRole,
        status: 'pending',
        requestedAt: serverTimestamp(),
        message: `User ${userProfile?.email || firebaseUser.email} has requested ${selectedRole} role access.`,
        createdAt: new Date().toISOString()
      };

      // Save to user's subcollection (this should always work with basic auth)
      await setDoc(doc(db, 'users', firebaseUser.uid, 'requests', 'roleRequest'), requestData);
      
      setRequestSubmitted(true);
      setHasExistingRequest(true);
      setOpenRequestDialog(false);
      setSelectedRole('');
      
      // Show success notification
      setTimeout(() => {
        setRequestSubmitted(false);
      }, 5000); // Hide after 5 seconds
      
    } catch (error: any) {
      console.error('Failed to submit role request:', error);
      
      // More specific error handling
      if (error?.code === 'permission-denied') {
        setErrorMessage('Permission denied. Please sign in again and try again.');
      } else if (error?.code === 'unavailable') {
        setErrorMessage('Service temporarily unavailable. Please try again later.');
      } else if (error?.code === 'unauthenticated') {
        setErrorMessage('Please sign in again and try again.');
      } else {
        setErrorMessage('Failed to submit request. Please check your connection and try again.');
      }
      
      // Hide error after 8 seconds
      setTimeout(() => setErrorMessage(''), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show signin prompt if not authenticated
  if (!firebaseUser || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userTickets = mockTickets.map(ticket => ({
    ...ticket,
    event: mockEvents.find(e => e.id === ticket.eventId)!
  }));

  const favoriteEvents = mockEvents.slice(0, 3);
  const recentlyViewed = mockEvents.slice(3, 6);

  const tabs = [
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Success Notification */}
      {requestSubmitted && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">Request Submitted!</p>
              <p className="text-xs">We'll review your request and get back to you.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">Error</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {userProfile.firstName || userProfile.displayName || 'User'} {userProfile.lastName || ''}
                </h1>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(userProfile.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                </p>
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full capitalize">
                  {userProfile.role}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">Events Attended</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">$0</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                
                {isCustomer && !hasExistingRequest && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setOpenRequestDialog(true)}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 text-primary hover:text-primary/90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Request Role Upgrade
                  </Button>
                )}
                
                {isCustomer && hasExistingRequest && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="h-2 w-2 text-white" />
                    </div>
                    <span className="text-xs text-yellow-800 font-medium">Request Pending</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Role Request Modal */}
        {openRequestDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border max-w-md w-full p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-2">Request Role Upgrade</h2>
              <p className="text-muted-foreground mb-6">
                Select the role you would like to request. Our team will review your application.
              </p>
              
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium mb-2">Choose Role</label>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select a role...</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
                
                {selectedRole && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-sm mb-2">
                      {selectedRole === 'organizer' ? 'Organizer Role Benefits:' : 'Admin Role Benefits:'}
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {selectedRole === 'organizer' ? (
                        <>
                          <li>• Create and manage events</li>
                          <li>• Access to analytics dashboard</li>
                          <li>• Revenue tracking</li>
                          <li>• Venue management tools</li>
                        </>
                      ) : (
                        <>
                          <li>• Full system access</li>
                          <li>• User management</li>
                          <li>• Platform analytics</li>
                          <li>• System configuration</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => {
                  setOpenRequestDialog(false);
                  setSelectedRole('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRoleRequest}
                  disabled={!selectedRole || isSubmitting}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Tickets</h2>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
                
                {userTickets.length > 0 ? (
                  <div className="space-y-4">
                    {userTickets.map(ticket => (
                      <div key={ticket.id} className="bg-card rounded-lg border p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold">{ticket.event.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                ticket.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : ticket.status === 'used'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(ticket.event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                {ticket.event.time}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2" />
                                {ticket.event.venue}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Purchased: </span>
                                <span>{new Date(ticket.purchaseDate).toLocaleDateString()}</span>
                                <span className="text-muted-foreground ml-4">Price: </span>
                                <span className="font-medium">${ticket.price}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't purchased any tickets yet. Start exploring events!
                    </p>
                    <Link href="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Favorite Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteEvents.map(event => (
                    <div key={event.id} className="bg-card rounded-lg border p-6">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.venue}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${event.price}</span>
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Recently Viewed</h2>
                <div className="space-y-4">
                  {recentlyViewed.map(event => (
                    <div key={event.id} className="bg-card rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.venue}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">${event.price}</p>
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm">View Again</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Account Settings</h2>
                
                {/* Role Upgrade Section - Only for customers */}
                {isCustomer && (
                  <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-lg border border-primary/20 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                            <Settings className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">Upgrade Your Account</h3>
                            <p className="text-sm text-muted-foreground">Get access to advanced features</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setOpenRequestDialog(true)}
                          disabled={hasExistingRequest}
                          className={`${
                            hasExistingRequest 
                              ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300'
                          }`}
                        >
                          {hasExistingRequest ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Request Pending
                            </>
                          ) : (
                            <>
                              <Settings className="h-4 w-4 mr-2" />
                              Request Upgrade
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-primary/10">
                          <h4 className="font-medium text-sm mb-2 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Organizer Benefits
                          </h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Create and manage events</li>
                            <li>• Access to analytics dashboard</li>
                            <li>• Revenue tracking</li>
                            <li>• Venue management tools</li>
                          </ul>
                        </div>
                        
                        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-primary/10">
                          <h4 className="font-medium text-sm mb-2 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            Admin Benefits
                          </h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Full system access</li>
                            <li>• User management</li>
                            <li>• Platform analytics</li>
                            <li>• System configuration</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue="John"
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={userProfile.email}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive event updates and promotions
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Event Reminders</h4>
                        <p className="text-sm text-muted-foreground">
                          Get reminded about upcoming events
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional offers and deals
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Security</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/venues">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Venues
                  </Button>
                </Link>
                <Link href="/organizer/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Become Organizer
                  </Button>
                </Link>
              </div>

              {/* Upgrade Notification for Customers */}
              {isCustomer && (
                <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <Settings className="h-3 w-3 text-white" />
                      </div>
                      <h4 className="font-medium text-sm">Unlock More Features</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to Organizer or Admin to access powerful tools and analytics.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setOpenRequestDialog(true)}
                      disabled={hasExistingRequest}
                      className={`w-full ${
                        hasExistingRequest 
                          ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed hover:bg-yellow-100' 
                          : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transform hover:scale-105 transition-all duration-300'
                      }`}
                    >
                      {hasExistingRequest ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Request Pending
                        </>
                      ) : (
                        'Request Upgrade'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Account Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Level</span>
                    <span className="font-medium">Silver</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Points</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next Reward</span>
                    <span className="font-medium">Gold (500 pts)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
