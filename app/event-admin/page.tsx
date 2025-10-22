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
      {/* Simple Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-muted"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-muted"></div>

      {/* Content Container */}
      <div className="relative z-10 pt-8 px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Clean Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="rounded-2xl p-6 shadow-lg bg-primary border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-3xl font-bold mb-2 text-primary-foreground"
                  >
                    Event Admin Dashboard
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal text-primary-foreground"
                  >
                    Welcome back, {userProfile?.firstName || 'Event Admin'}! 
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              onClick={() => setActiveTab('overview')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <BarChart3 className="h-8 w-8 mr-3" />
              Overview
            </Button>
            <Button 
              onClick={() => setActiveTab('events')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <CalendarDays className="h-8 w-8 mr-3" />
              My Events
            </Button>
            <Button 
              onClick={() => setActiveTab('analytics')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <Activity className="h-8 w-8 mr-3" />
              Analytics
            </Button>
          </div>
        </motion.div>

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
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-card-foreground">Total Events</p>
                    <div className="text-2xl font-bold mb-1 text-foreground">{totalEvents}</div>
                  </div>
                  <div className="rounded-lg p-3 ml-4 bg-primary/10">
                    <CalendarDays className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-card-foreground">Active Today</p>
                    <div className="text-2xl font-bold mb-1 text-foreground">{activeEvents}</div>
                  </div>
                  <div className="rounded-lg p-3 ml-4 bg-primary/10">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-card-foreground">Upcoming</p>
                    <div className="text-2xl font-bold mb-1 text-foreground">{upcomingEvents}</div>
                  </div>
                  <div className="rounded-lg p-3 ml-4 bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-card-foreground">Completed</p>
                    <div className="text-2xl font-bold mb-1 text-foreground">{completedEvents}</div>
                  </div>
                  <div className="rounded-lg p-3 ml-4 bg-primary/10">
                    <XCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-foreground">
                <TrendingUp className="w-6 h-6 mr-2 text-primary" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('events')}
                  className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md bg-card border border-border hover:bg-accent/20"
                >
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-3 text-primary" />
                    <span className="text-foreground font-medium">View All Events</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md bg-card border border-border hover:bg-accent/20"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-primary" />
                    <span className="text-foreground font-medium">Event Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md bg-card border border-border hover:bg-accent/20"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-primary" />
                    <span className="text-foreground font-medium">Manage Team</span>
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
            <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-foreground">My Assigned Events</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-foreground">
                    {loading ? 'Loading...' : `${assignedEvents.length} events assigned`}
                  </div>
                </div>
              </div>

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
                  {assignedEvents.map((event) => (
                    <motion.div 
                      key={event.id} 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-card"
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
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                          <span>{event.venue?.name || 'Venue TBD'}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
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
                          className="border-border transition-all duration-200 hover:shadow-md hover:bg-accent/20"
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
            </div>
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
            <motion.div variants={itemVariants} className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
              <h3 className="text-3xl font-bold mb-8 text-foreground">Event Analytics</h3>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2 text-foreground">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">Detailed analytics and reporting features will be available here.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
