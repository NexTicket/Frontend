"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
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

  const organizerEvents = mockEvents.slice(0, 4); // sliced for simplicity
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
    <div className="min-h-screen bg-background relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pb-1">Organizer Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {organizer.name}</p>
            </div>
            <Link href="/organizer/events/new">
              <Button className="hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const getHoverColor = (color: string) => {
              switch (color) {
                case 'bg-blue-500': return 'hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800 group-hover:text-blue-600 dark:group-hover:text-blue-400';
                case 'bg-green-500': return 'hover:shadow-green-500/5 dark:hover:shadow-green-500/10 hover:border-green-200 dark:hover:border-green-800 group-hover:text-green-600 dark:group-hover:text-green-400';
                case 'bg-purple-500': return 'hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800 group-hover:text-purple-600 dark:group-hover:text-purple-400';
                case 'bg-orange-500': return 'hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10 hover:border-orange-200 dark:hover:border-orange-800 group-hover:text-orange-600 dark:group-hover:text-orange-400';
                default: return 'hover:shadow-primary/5 dark:hover:shadow-primary/10';
              }
            };
            return (
              <div
                key={index}
                className={`bg-card rounded-lg border p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer ${getHoverColor(stat.color)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium text-muted-foreground transition-colors duration-300 ${getHoverColor(stat.color)}`}>{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

   

      
        {/* Navigation Tabs */}
        <div className="border-b mb-8 bg-card/50 dark:bg-card/30 rounded-t-lg backdrop-blur-sm">
          <nav className="flex space-x-8 relative px-6">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm relative transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 rounded-t-lg px-3'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>



        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Events */}
              <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Events</h3>
                  <Link href="/organizer/events">
                    <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">View All</Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {organizerEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:border-primary/20 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 dark:group-hover:from-primary/40 dark:group-hover:to-primary/30 transition-all duration-300">
                          <Calendar className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                          <h4 className="font-medium group-hover:text-primary transition-colors duration-300">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()} • {event.venue}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/organizer/events/${event.id}/view`}>
                          <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/organizer/events/${event.id}/edit`}>
                          <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
                <div className="h-64 bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 transition-all duration-300">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2 hover:text-primary transition-colors duration-300" />
                    <p className="text-muted-foreground hover:text-primary/80 transition-colors duration-300">Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/organizer/events/new">
                    <Button className="w-full justify-start hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/organizer/venues/new">
                    <Button variant="outline" className="w-full justify-start hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                      <MapPin className="mr-2 h-4 w-4" />
                      Add Venue
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Staff
                  </Button>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {organizerEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="p-3 bg-gradient-to-br from-muted/50 to-muted rounded-lg hover:from-primary/10 hover:to-primary/20 dark:hover:from-primary/20 dark:hover:to-primary/30 transition-all duration-300 cursor-pointer group">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors duration-300">{event.title}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1 group-hover:text-primary transition-colors duration-300" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1 group-hover:text-primary transition-colors duration-300" />
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
                <Button className="hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizerEvents.map(event => (
                <div key={event.id} className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:border-primary/20 dark:hover:border-primary/30 hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg mb-4 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 dark:group-hover:from-primary/40 dark:group-hover:to-primary/30 transition-all duration-300">
                    <Calendar className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{event.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 group-hover:text-primary transition-colors duration-300" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 group-hover:text-primary transition-colors duration-300" />
                      {event.venue}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 group-hover:text-primary transition-colors duration-300" />
                      {event.availableTickets} / {event.capacity} available
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary group-hover:text-primary/80 transition-colors duration-300">${event.price}</span>
                    <div className="flex items-center space-x-2">
                      <Link href={`/organizer/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/organizer/events/${event.id}/view`}>
                        <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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
              <Button className="hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Add Venue
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organizerVenues.map(venue => (
                <div key={venue.id} className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:border-primary/20 dark:hover:border-primary/30 hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg mb-4 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 dark:group-hover:from-primary/40 dark:group-hover:to-primary/30 transition-all duration-300">
                    <MapPin className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{venue.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 group-hover:text-primary transition-colors duration-300" />
                      {venue.city}, {venue.state}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 group-hover:text-primary transition-colors duration-300" />
                      Capacity: {venue.capacity.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {venue.amenities.length} amenities
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
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
              <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                <div className="h-64 bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 transition-all duration-300">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2 hover:text-primary transition-colors duration-300" />
                    <p className="text-muted-foreground hover:text-primary/80 transition-colors duration-300">Revenue chart would go here</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                <h3 className="text-lg font-semibold mb-4">Event Categories</h3>
                <div className="h-64 bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 transition-all duration-300">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2 hover:text-primary transition-colors duration-300" />
                    <p className="text-muted-foreground hover:text-primary/80 transition-colors duration-300">Category distribution chart</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
              <h3 className="text-lg font-semibold mb-4">Top Performing Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200">
                      <th className="text-left py-2">Event</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Tickets Sold</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizerEvents.map(event => (
                      <tr key={event.id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200 cursor-pointer group">
                        <td className="py-2 font-medium group-hover:text-primary transition-colors duration-300">{event.title}</td>
                        <td className="py-2 text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="py-2">{event.capacity - event.availableTickets}</td>
                        <td className="py-2 group-hover:text-primary transition-colors duration-300">${(event.price * (event.capacity - event.availableTickets)).toLocaleString()}</td>
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
            
            <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name</label>
                    <input
                      type="text"
                      defaultValue="Event Organizer"
                      className="w-full px-3 py-2 border rounded-md bg-background hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      defaultValue={organizer.email}
                      className="w-full px-3 py-2 border rounded-md bg-background hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md bg-background hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                    placeholder="Tell us about your organization..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
              <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Account</label>
                  <input
                    type="text"
                    placeholder="Account number"
                    className="w-full px-3 py-2 border rounded-md bg-background hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Routing Number</label>
                  <input
                    type="text"
                    placeholder="Routing number"
                    className="w-full px-3 py-2 border rounded-md bg-background hover:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200">Cancel</Button>
              <Button className="hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">Save Changes</Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
