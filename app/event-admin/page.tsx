/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Settings,
  Eye,
  BarChart3,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  ChevronRight,
  Activity,
  TrendingUp
} from 'lucide-react';
import { fetchMyAssignedEvents } from '@/lib/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: string;
  venue?: {
    id: number;
    name: string;
    location: string;
  };
  organizer?: {
    name: string;
  };
  checkinOfficerUids?: string[];
}

export default function EventAdminDashboard() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'analytics'>('overview');
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Fetch assigned events for event admin
  useEffect(() => {
    const loadAssignedEvents = async () => {
      if (!userProfile || userProfile.role !== 'event_admin') return;
      
      setLoading(true);
      try {
        console.log('🎯 Fetching assigned events for event admin:', userProfile.uid);
        const response = await fetchMyAssignedEvents();
        const events = response?.data || response || [];
        setAssignedEvents(events);
        console.log('📊 Loaded assigned events:', events);
      } catch (error) {
        console.error('❌ Failed to load assigned events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedEvents();
  }, [userProfile]);

  // Redirect if not authenticated or not event admin
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
  }, [isLoading, firebaseUser, router]);

  // Check if user is authorized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading
          size="lg"
          text="Loading..."
        />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'event_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg mb-4 text-foreground">Access Denied</div>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const totalEvents = assignedEvents.length;
  const activeEvents = assignedEvents.filter(e => {
    const eventDate = new Date(e.startDate);
    const now = new Date();
    return eventDate.toDateString() === now.toDateString();
  }).length;
  const upcomingEvents = assignedEvents.filter(e => {
    const eventDate = new Date(e.startDate);
    const now = new Date();
    return eventDate > now;
  }).length;
  const completedEvents = assignedEvents.filter(e => {
    const eventDate = new Date(e.startDate);
    const now = new Date();
    return eventDate < now;
  }).length;

  // Get event status
  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    
    if (eventDate.toDateString() === now.toDateString()) {
      return 'active';
    } else if (eventDate > now) {
      return 'upcoming';
    } else {
      return 'completed';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'active': return <CheckCircle className="w-4 h-4" />;
  //     case 'upcoming': return <Clock className="w-4 h-4" />;
  //     case 'completed': return <XCircle className="w-4 h-4" />;
  //     default: return <AlertCircle className="w-4 h-4" />;
  //   }
  // };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  // Handle event click to open detail modal
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(false);
  };

  // Open event detail page
  const openEventDetail = (eventId: number) => {
    router.push(`/event-admin/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-muted/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-muted/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="bg-primary rounded-2xl p-6 shadow-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-primary-foreground">Event Admin Dashboard</h1>
                <p className="text-lg text-primary-foreground/90">Manage your assigned events and team</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium text-primary-foreground">{userProfile?.firstName} {userProfile?.lastName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-card rounded-2xl p-1 border-2 border-border">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'events', label: 'My Events', icon: CalendarDays },
              { id: 'analytics', label: 'Analytics', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                    <p className="text-3xl font-bold text-foreground">{totalEvents}</p>
                  </div>
                  <CalendarDays className="w-8 h-8 text-foreground" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                    <p className="text-3xl font-bold text-blue-600">{activeEvents}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-3xl font-bold text-orange-500">{upcomingEvents}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-foreground">{completedEvents}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-foreground" />
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-medium mb-4 flex items-center text-foreground">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('events')}
                  className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:bg-muted"
                >
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-3 text-primary" />
                    <span className="text-foreground">View All Events</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:bg-muted"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-primary" />
                    <span className="text-foreground">Event Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:bg-muted"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-primary" />
                    <span className="text-foreground">Manage Team</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {loading ? (
              <div className="text-center py-12">
                <Loading
                  size="md"
                  text="Loading your assigned events..."
                />
              </div>
            ) : assignedEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2 text-foreground">No Assigned Events</h3>
                <p className="text-muted-foreground">You have not been assigned to any events yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedEvents.map((event, index) => (
                  <motion.div 
                    key={event.id} 
                    variants={itemVariants}
                    className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getEventStatus(event))}`}>
                        {getEventStatus(event)}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-foreground" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-foreground" />
                        <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-foreground" />
                        <span>{event.venue?.name || 'Venue TBD'}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0 text-foreground" />
                        <span>{event.capacity} capacity</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEventDetail(event.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-border transition-all duration-200 hover:shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-medium mb-4 text-foreground">Event Analytics</h3>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2 text-foreground">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Detailed analytics and reporting features will be available here.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
