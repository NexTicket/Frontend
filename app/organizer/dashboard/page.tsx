"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Edit,
  Settings,
  MapPin,
  Clock,
  Ticket,
  BarChart3,
  PieChart,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';
import RouteGuard from '@/components/auth/routeGuard';

export default function OrganizerDashboard() {
  const { userProfile, firebaseUser, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Check authentication and organizer role
  useEffect(() => {
    if (!isLoading && (!firebaseUser || !userProfile)) {
      router.push('/auth/signin');
    } else if (!isLoading && userProfile && userProfile.role !== 'organizer') {
      router.push('/dashboard'); // Redirect non-organizer users
    }
  }, [isLoading, firebaseUser, userProfile, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading organizer dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not organizer
  if (!firebaseUser || !userProfile || userProfile.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need organizer privileges to access this page.</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Mock organizer data
  const organizer = {
    name: 'Event Organizer',
    email: 'organizer@nexticket.com',
    totalEvents: 15,
    totalRevenue: 45000,
    totalTicketsSold: 2500,
    averageRating: 4.7
  };

  const organizerEvents = mockEvents.slice(0, 4);
  const organizerVenues = mockVenues.slice(0, 2);

  const stats = [
    {
      title: 'Total Events',
      value: organizer.totalEvents,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Revenue',
      value: `$${organizer.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Tickets Sold',
      value: organizer.totalTicketsSold.toLocaleString(),
      icon: Ticket,
      color: 'bg-purple-500'
    },
    {
      title: 'Average Rating',
      value: organizer.averageRating,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'My Events' },
    { id: 'venues', label: 'My Venues' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <RouteGuard requiredRole="organizer">
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile.firstName || userProfile.displayName || 'Organizer'}!
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/organizer/events/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Events */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <Link href="/organizer/events">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {organizerEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} • {event.venue}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/organizer/events/new">
                    <Button className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/organizer/venues/new">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="mr-2 h-4 w-4" />
                      Add Venue
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Staff
                  </Button>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {organizerEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {event.availableTickets} tickets available
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Events</h2>
              <Link href="/organizer/events/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizerEvents.map(event => (
                <div key={event.id} className="bg-card rounded-lg border p-6">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.venue}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.availableTickets} / {event.capacity} available
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${event.price}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Venues</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Venue
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organizerVenues.map(venue => (
                <div key={venue.id} className="bg-card rounded-lg border p-6">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold mb-2">{venue.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {venue.city}, {venue.state}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {venue.capacity.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {venue.amenities.length} amenities
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Revenue chart would go here</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Event Categories</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Category distribution chart</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performing Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Event</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Tickets Sold</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizerEvents.map(event => (
                      <tr key={event.id} className="border-b">
                        <td className="py-2 font-medium">{event.title}</td>
                        <td className="py-2 text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="py-2">{event.capacity - event.availableTickets}</td>
                        <td className="py-2">${(event.price * (event.capacity - event.availableTickets)).toLocaleString()}</td>
                        <td className="py-2">4.{Math.floor(Math.random() * 5) + 5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name</label>
                    <input
                      type="text"
                      defaultValue="Event Organizer"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      defaultValue={organizer.email}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Tell us about your organization..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Account</label>
                  <input
                    type="text"
                    placeholder="Account number"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Routing Number</label>
                  <input
                    type="text"
                    placeholder="Routing number"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </RouteGuard>
  );
}
