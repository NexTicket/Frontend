"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Loading } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ui/error-display';
import { 
  Plus, 
  Calendar,  
  DollarSign, 
  TrendingUp,
  Ticket,
  Users,
  Activity,
  BarChart3,
  Eye,
  Edit,
  RefreshCw,
} from 'lucide-react';
import { deleteEvent, fetchEventsByOrganizer } from '@/lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const containerVariants: any = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      duration: 0.5,
      ease: [0.17, 0.67, 0.83, 0.67] as any
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.17, 0.67, 0.83, 0.67] as any } }
};

// Theme colors for matching admin dashboard
const darkBg = "#181A20";
const blueHeader = "#1877F2";
const cardBg = "#23262F";
const greenBorder = "#39FD48" + '50';
const cardShadow = "0 2px 16px 0 rgba(57,253,72,0.08)";

export default function OrganizerDashboard() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  console.log('User profile in organizer dashboard:', userProfile);

  // Check authentication and organizer role
  useEffect(() => {
    if (!isLoading && (!firebaseUser || !userProfile)) {
      router.push('/auth/signin');
    } else if (!isLoading && userProfile && userProfile.role !== 'organizer') {
      router.push('/dashboard'); // Redirect non-organizer users
    }
  }, [isLoading, firebaseUser, userProfile, router]);

  // Fetch organizer-specific events
  useEffect(() => {
    const loadOrganizerEvents = async () => {
      if (!userProfile?.uid) return;
      
      setEventsLoading(true);
      try {
        // Use the new fetchEventsByOrganizer function
        const response = await fetchEventsByOrganizer(userProfile.uid);
        const eventsData = response?.data || response || [];
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error('Failed to load organizer events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    if (userProfile?.role === 'organizer') {
      loadOrganizerEvents();
    }
  }, [userProfile]);

  // const handleDeleteEvent = async (eventId: string) => {
  //   if (confirm('Are you sure you want to delete this event?')) {
  //     try {
  //       await deleteEvent(eventId);
  //       // Refresh events list
  //       const response = await fetchEventsByOrganizer(userProfile?.uid || '');
  //       const eventsData = response?.data || response || [];
  //       setEvents(Array.isArray(eventsData) ? eventsData : []);
  //       alert('Event deleted successfully!');
  //     } catch (error) {
  //       console.error('Failed to delete event:', error);
  //       alert('Failed to delete event');
  //     }
  //   }
  // };

  const handleRefresh = () => {
    setRefreshing(true);
    // Refresh events data
    if (userProfile?.uid) {
      fetchEventsByOrganizer(userProfile.uid)
        .then(response => {
          const eventsData = response?.data || response || [];
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        })
        .catch(error => {
          console.error('Failed to refresh events:', error);
        })
        .finally(() => {
          setRefreshing(false);
        });
    } else {
      setRefreshing(false);
    }
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkBg }}>
        <Loading
          size="lg"
          text="Loading organizer dashboard..."
          className="text-white"
        />
      </div>
    );
  }

  // Show access denied if not authenticated or not organizer
  if (!firebaseUser || !userProfile || userProfile.role !== 'organizer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: darkBg }}>
        <ErrorDisplay
          type="auth"
          title="Access Denied"
          message="You need organizer privileges to access this page."
          variant="card"
          className="max-w-md"
        />
      </div>
    );
  }

  // Calculate stats from real events data
  const totalEvents = events.length;
  const activeEvents = events.filter(event => event.status === 'APPROVED').length;
  const pendingEvents = events.filter(event => event.status === 'PENDING').length;
  const totalRevenue = events.reduce((sum, event) => sum + (event.revenue || 0), 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);

  const stats = [
    {
      title: 'Total Events',
      value: totalEvents,
      icon: <Calendar size={24} style={{ color: '#CBF83E' }} />,
      trend: 12.5,
      color: '#CBF83E',
      subtitle: `${pendingEvents} pending approval`
    },
    {
      title: 'Active Events',
      value: activeEvents,
      icon: <Activity size={24} style={{ color: '#CBF83E' }} />,
      trend: 8.2,
      color: '#CBF83E',
      subtitle: 'Currently running'
    },
    {
      title: 'Monthly Revenue',
      value: `LKR ${totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} style={{ color: '#CBF83E' }} />,
      trend: 15.8,
      color: '#CBF83E',
      subtitle: 'This month'
    },
    {
      title: 'Tickets Sold',
      value: totalTicketsSold.toLocaleString(),
      icon: <Ticket size={24} style={{ color: '#CBF83E' }} />,
      trend: 23.1,
      color: '#CBF83E',
      subtitle: 'Total sales'
    }
  ];

  // Mock data for charts (can be replaced with real analytics later)
  const revenueData = [
    { name: 'Jan', revenue: 25000, tickets: 80, events: 5 },
    { name: 'Feb', revenue: 32000, tickets: 95, events: 7 },
    { name: 'Mar', revenue: 28000, tickets: 82, events: 6 },
    { name: 'Apr', revenue: 41000, tickets: 118, events: 9 },
    { name: 'May', revenue: 38000, tickets: 105, events: 8 },
    { name: 'Jun', revenue: 47000, tickets: 139, events: 11 },
    { name: 'Jul', revenue: 54000, tickets: 160, events: 13 }
  ];

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    subtitle?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, subtitle }) => {
    const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingUp;
    const trendColor = trend && trend > 0 ? 'text-green-500' : 'text-red-500';

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1" style={{ color: '#fff' }}>{title}</p>
            <div className="text-2xl font-bold mb-1" style={{ color: '#ABA8A9' }}>{value}</div>
            {subtitle && (
              <p className="text-xs" style={{ color: '#ABA8A9' }}>{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <TrendIcon size={12} className={trendColor} />
                <span className={`text-xs ml-1 font-medium ${trendColor}`}>
                  {Math.abs(trend)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg p-3 ml-4" style={{ backgroundColor: '#D8DFEE' + '40' }}>
            {icon}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: darkBg }}>
      {/* Simple Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#ABA8A9' }}></div>
      
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
            <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: blueHeader, borderColor: greenBorder, boxShadow: cardShadow }}>
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-3xl font-bold mb-2"
                    style={{ color: '#fff' }}
                  >
                    Organizer Dashboard
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal"
                    style={{ color: '#fff' }}
                  >
                    Welcome back, {userProfile?.firstName || userProfile?.email?.split('@')[0] || 'Organizer'}! 
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-6 py-3 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)' }}
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button 
                onClick={() => router.push('/organizer/events/new')}
                className="h-16 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
              >
                <Plus className="h-8 w-8 mr-3" style={{ color: '#CBF83E' }} />
                Create New Event
              </Button>
              <Button 
                onClick={() => router.push('/organizer/events')}
                className="h-16 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
              >
                <Calendar className="h-8 w-8 mr-3" style={{ color: '#CBF83E' }}/>
                Manage Events
              </Button>
              <Button 
                onClick={() => router.push('/organizer/analytics')}
                className="h-16 backdrop-blur-xl text-lg border rounded-2xl p-8 shadow-xl transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
              >
                <BarChart3 className="h-8 w-8 mr-3" style={{ color: '#CBF83E' }} />
                View Analytics
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </motion.div>

          {/* My Events Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold" style={{ color: '#fff' }}>My Events</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium" style={{ color: '#fff' }}>
                    {eventsLoading ? 'Loading...' : `${events.length} events total`}
                  </div>
                  <Button 
                    onClick={() => router.push('/organizer/events/new')}
                    className="transition-all duration-200 hover:shadow-md text-white"
                    style={{ backgroundColor: '#0D6EFD' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
              
              {eventsLoading ? (
                <div className="text-center py-8">
                  <Loading
                    size="md"
                    text="Loading your events..."
                    className="text-white"
                  />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#CBF83E' }} />
                  <p className="text-lg font-semibold" style={{ color: '#fff' }}>No Events Yet</p>
                  <p className="text-sm mb-4" style={{ color: '#ABA8A9' }}>Create your first event to get started</p>
                  <Button 
                    onClick={() => router.push('/organizer/events/new')}
                    className="text-white"
                    style={{ backgroundColor: '#0D6EFD' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="rounded-2xl border p-6 bg-background shadow-md" style={{ backgroundColor: darkBg, borderColor: greenBorder }}>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-white truncate">{event.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3" style={{ color: '#ABA8A9' }}>
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <span className="text-xs rounded-full px-3 py-1" style={{ color: '#CBF83E', backgroundColor: '#CBF83E' + '20' }}>
                              {event.category}
                            </span>
                            <span className="text-xs rounded-full px-3 py-1" style={{ color: '#fff', backgroundColor: '#2a2d34' }}>
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs rounded-full px-3 py-1" style={{ color: '#fff', backgroundColor: '#2a2d34' }}>
                              {event.venue?.name || 'No venue'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
                          <Button 
                            onClick={() => router.push(`/organizer/events/${event.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            onClick={() => router.push(`/organizer/events/${event.id}/edit`)}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        onClick={() => router.push('/organizer/events')}
                        variant="outline"
                        style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
                      >
                        View All {events.length} Events
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Analytics Chart */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: '#fff' }}>Revenue Overview</h3>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" style={{ color: '#fff' }} />
                  <span className="text-sm font-medium" style={{ color: '#fff' }}>Monthly View</span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D6EFD" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0D6EFD" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#808080" />
                    <XAxis dataKey="name" style={{ fill: '#fff' }} />
                    <YAxis style={{ fill: '#fff' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1115', border: `1px solid ${greenBorder}`, color: '#fff' }} />
                    <Area type="monotone" dataKey="revenue" stroke='#0D6EFD' fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}