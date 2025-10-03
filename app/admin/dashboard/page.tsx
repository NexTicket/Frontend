'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  Star,
  AlertTriangle,
  RefreshCw,
  Settings,
  Plus,
  Bell,
  Download,
  LogOut,
  ArrowLeft,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  PersonStanding
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import RouteGuard from '@/components/auth/routeGuard';
import { fetchEvents, approveEvent, rejectEvent } from '@/lib/api';

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Mock data for analytics
const revenueData = [
  { name: 'Jan', revenue: 45000, tickets: 120, events: 8 },
  { name: 'Feb', revenue: 52000, tickets: 145, events: 12 },
  { name: 'Mar', revenue: 48000, tickets: 132, events: 10 },
  { name: 'Apr', revenue: 61000, tickets: 168, events: 15 },
  { name: 'May', revenue: 58000, tickets: 155, events: 13 },
  { name: 'Jun', revenue: 67000, tickets: 189, events: 18 },
  { name: 'Jul', revenue: 74000, tickets: 210, events: 22 }
];

const categoryData = [
  { name: 'Concerts', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Sports', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Theater', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Comedy', value: 12, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 8, color: 'hsl(var(--chart-5))' }
];

const weeklyData = [
  { day: 'Mon', sales: 45, users: 12 },
  { day: 'Tue', sales: 52, users: 19 },
  { day: 'Wed', sales: 48, users: 15 },
  { day: 'Thu', sales: 61, users: 25 },
  { day: 'Fri', sales: 58, users: 22 },
  { day: 'Sat', sales: 67, users: 31 },
  { day: 'Sun', sales: 74, users: 28 }
];

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'Purchased ticket', event: 'Rock Concert 2025', time: '2 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 2, user: 'Jane Smith', action: 'Created event', event: 'Theater Night', time: '5 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 3, user: 'Mike Johnson', action: 'Cancelled booking', event: 'Sports Match', time: '10 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 4, user: 'Sarah Wilson', action: 'Updated profile', event: '', time: '15 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
  { id: 5, user: 'Tom Brown', action: 'Purchased VIP ticket', event: 'Music Festival', time: '20 min ago', avatar: '/Images/profile-avatar-account-icon.png' }
];

const topEvents = [
  { id: 1, name: 'Summer Music Festival', tickets: 1250, revenue: 125000, growth: 15.2 },
  { id: 2, name: 'Comedy Night Special', tickets: 890, revenue: 89000, growth: 8.7 },
  { id: 3, name: 'Tech Conference 2025', tickets: 650, revenue: 195000, growth: 22.1 },
  { id: 4, name: 'Basketball Championship', tickets: 2100, revenue: 210000, growth: -3.2 },
  { id: 5, name: 'Art Exhibition', tickets: 320, revenue: 32000, growth: 12.5 }
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
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend && trend > 0 ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-card-foreground">{title}</p>
          <div className="text-2xl font-bold mb-1 text-foreground">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
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
        <div className="rounded-lg p-3 ml-4 bg-primary/10">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const { userProfile, firebaseUser, logout, isLoading } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  console.log('User profile after admin redirectory:', userProfile);

  // Fetch pending events
  useEffect(() => {
    const loadPendingEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await fetchEvents('PENDING');
        const events = response?.data || response || [];
        setPendingEvents(events);
      } catch (error) {
        console.error('Failed to load pending events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (userProfile?.role === 'admin') {
      loadPendingEvents();
    }
  }, [userProfile]);

  const handleApproveEvent = async (eventId: string) => {
    try {
      await approveEvent(eventId);
      // Refresh pending events
      const response = await fetchEvents('PENDING');
      const events = response?.data || response || [];
      setPendingEvents(events);
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      await rejectEvent(eventId);
      // Refresh pending events
      const response = await fetchEvents('PENDING');
      const events = response?.data || response || [];
      setPendingEvents(events);
    } catch (error) {
      console.error('Failed to reject event:', error);
    }
  };

  // No need for additional auth checks - admin layout handles this
  // useEffect(() => {
  //   if (!isLoading && (!firebaseUser || !userProfile)) {
  //     router.push('/auth/signin');
  //   } else if (!isLoading && userProfile && userProfile.role !== 'admin') {
  //     router.push('/dashboard'); // Redirect non-admin users
  //   }
  // }, [isLoading, firebaseUser, userProfile, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!firebaseUser || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="backdrop-blur-xl border rounded-3xl p-8 shadow-2xl text-center max-w-md bg-card">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-destructive/20">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-card-foreground">Access Denied</h1>
          <p className="mb-6 text-muted-foreground">
            You need admin privileges to access this page.
          </p>
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="text-primary-foreground hover:opacity-90 transition-opacity bg-primary"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      icon: <Users size={24} className="text-primary" />,
      trend: 12.5,
      color: 'foreground',
      subtitle: '145 new this week'
    },
    {
      title: 'Active Events',
      value: '186',
      icon: <Calendar size={24} className="text-primary" />,
      trend: 8.2,
      color: 'foreground',
      subtitle: '23 ending soon'
    },
    {
      title: 'Monthly Revenue',
      value: 'LKR 847K',
      icon: <DollarSign size={24} className="text-primary" />,
      trend: 15.8,
      color: 'primary',
      subtitle: 'Target: LKR 1M'
    },
    {
      title: 'Tickets Sold',
      value: '12,493',
      icon: <Activity size={24} className="text-primary" />,
      trend: 23.1,
      color: 'primary',
      subtitle: '1,847 today'
    },
    {
      title: 'Active Venues',
      value: '67',
      icon: <MapPin size={24} className="text-primary" />,
      trend: 5.4,
      color: 'primary',
      subtitle: '12 pending approval'
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      icon: <Star size={24} className="text-primary" />,
      trend: 2.1,
      color: 'primary',
      subtitle: 'From 2,847 reviews'
    }
  ];

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
                    Admin Dashboard
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal text-primary-foreground"
                  >
                    Welcome back, {userProfile?.firstName || 'Admin'}! 
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {/* <Button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-6 py-3 text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md bg-primary"
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button> */}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* System Alert
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="rounded-full p-2 mr-3 bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-destructive">System Maintenance Notice</h4>
                  <p className="text-sm text-muted-foreground">Scheduled maintenance on July 25, 2025 from 2:00 AM - 4:00 AM LKT</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm border-border text-destructive"
                >
                  Review
                </Button>
              </div>
            </div>
          </motion.div> */}

          {/* Quick Action Buttons */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Button 
                onClick={() => router.push('/admin/users')}
                className="h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl bg-card hover:bg-card/80 text-card-foreground"
              >
                <Users className="h-8 w-8 mr-3 text-primary" />
                Manage Users
              </Button>
              <Button 
                onClick={() => router.push('/admin/events')}
                className="h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl bg-card hover:bg-card/80 text-card-foreground"
              >
                <Calendar className="h-8 w-8 mr-3 text-primary"/>
                Manage Events
              </Button>
              <Button 
                onClick={() => router.push('/admin/staff')}
                className="h-10 backdrop-blur-xl text-lg border rounded-2xl p-8 shadow-xl bg-card hover:bg-card/80 text-card-foreground"
              >
                <PersonStanding className="h-8 w-8 mr-3 text-primary" />
                Manage Staff
              </Button>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 backdrop-blur-xl text-lg border rounded-2xl p-8 shadow-xl bg-card hover:bg-card/80 text-card-foreground"
              >
                <RefreshCw className={`h-8 w-8 mr-3 text-primary ${refreshing ? 'animate-spin' : ''}`} />
                System Refresh
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </motion.div>

          {/* Pending Events Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-foreground">Pending Event Approvals</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-foreground">
                    {loadingEvents ? 'Loading...' : `${pendingEvents.length} events pending`}
                  </div>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline" 
                    size="sm" 
                    className="transition-all duration-200 hover:shadow-md border-border text-foreground bg-transparent hover:bg-accent"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              
              {loadingEvents ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-sm text-foreground">Loading pending events...</p>
                </div>
              ) : pendingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold text-foreground">No Pending Events</p>
                  <p className="text-sm text-muted-foreground">All events have been reviewed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border p-6 bg-card shadow-md">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-semibold text-foreground truncate">{event.title}</h4>
                            <span className="text-xs rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 font-medium">
                              PENDING
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-3">
                            <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                              {event.category}
                            </span>
                            <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1">
                              {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No date'}
                            </span>
                            {event.venue?.name && (
                              <span className="text-xs rounded-full bg-blue-100 text-blue-800 px-3 py-1">
                                {event.venue.name}
                              </span>
                            )}
                            {event.Tenant?.name && (
                              <span className="text-xs rounded-full bg-purple-100 text-purple-800 px-3 py-1">
                                By: {event.Tenant.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
                          <Button 
                            onClick={() => handleApproveEvent(String(event.id))}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleRejectEvent(String(event.id))}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
              {/* Quick Actions Dashboard */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Analytics Chart */}
              <div className="lg:col-span-2 backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground">Revenue Analytics</h3>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                    <span className="text-sm font-medium text-foreground">Monthly View</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor='hsl(var(--primary))' stopOpacity={0.3}/>
                          <stop offset="95%" stopColor='hsl(var(--background))' stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" style={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis style={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                      <Area type="monotone" dataKey="revenue" stroke='hsl(var(--primary))' fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground">Live Activities</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {recentActivities.slice(0, 6).map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl transition-colors duration-200 hover:bg-accent/20">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{activity.user}</p>
                        <p className="text-xs truncate text-foreground">{activity.action}</p>
                        {activity.event && (
                          <p className="text-xs font-medium truncate text-blue-600">{activity.event}</p>
                        )}
                        <p className="text-xs mt-1 text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 transition-all duration-200 hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white border-border"
                  onClick={() => setActivityDialogOpen(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  View All Activities
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Top Events Performance */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-foreground">Top Performing Events</h3>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="transition-all duration-200 hover:shadow-md border-border text-foreground bg-transparent hover:bg-accent"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {/* <Button 
                    size="sm" 
                    className="text-white hover:opacity-90 transition-opacity shadow-lg"
                    style={{ background: '#0D6EFD' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button> */}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Event Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Tickets Sold</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Revenue</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Growth</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEvents.map((event, index) => (
                      <tr key={event.id} className="border-b border-border transition-colors duration-200 hover:bg-accent/20"> 
                        <td className="py-4 px-6">
                          <div className="font-semibold text-foreground">{event.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-primary">{event.tickets.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-foreground">LKR {event.revenue.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            event.growth >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.growth >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(event.growth)}%
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" style={{ color: '#fff' }}/>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" style={{ color: '#fff' }} />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:opacity-80" style={{ color: '#fff' }}>
                              <MoreVertical className="h-4 w-4"style={{ color: '#fff' }} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Mock Events and Venues */}
          <motion.div variants={itemVariants} className="mb-20">
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
              {/* Mock Events */}
              {/* <div className="border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Mock Events</h3>
                <div className="space-y-4">
                  {[
                    { id: 'e1', title: 'Rock Fest Colombo', description: 'A night of rock music with top bands.', category: 'Concert', date: '2025-09-12' },
                    { id: 'e2', title: 'Tech Summit 2025', description: 'Talks and workshops on emerging tech.', category: 'Conference', date: '2025-10-03' },
                    { id: 'e3', title: 'Laughter Night', description: 'Stand-up comedy special.', category: 'Comedy', date: '2025-08-21' }
                  ].map(ev => (
                    <div key={ev.id} className="rounded-2xl border p-4 bg-background shadow-md flex flex-col sm:flex-row items-start sm:items-center" style={{ backgroundColor: darkBg, borderColor: greenBorder }}>
                      <div className="flex-1 min-w-0">
                        <div className="block text-lg font-semibold text-white truncate">{ev.title}</div>
                        <p className="text-sm text-muted-foreground truncate" style={{ color: '#ABA8A9' }}>{ev.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1" style={{ color: greenBorder, backgroundColor: greenBorder + '20' }}>{ev.category}</span>
                          <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1" style={{ color: '#fff', backgroundColor: '#2a2d34' }}>{ev.date}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <Button variant="outline" className="flex items-center" style={{ backgroundColor: darkBg, borderColor: greenBorder, color: '#fff' }}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Mock Venues */}
              {/* <div className="border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Mock Venues</h3>
                <div className="space-y-4">
                  {[
                    { id: 'v1', name: 'Nelum Pokuna', description: 'Iconic performing arts theatre.', city: 'Colombo', state: 'WP', capacity: 1200 },
                    { id: 'v2', name: 'Sugathadasa Indoor Stadium', description: 'Large indoor venue for sports and events.', city: 'Colombo', state: 'WP', capacity: 5000 },
                    { id: 'v3', name: 'BMICH Hall A', description: 'Convention center hall.', city: 'Colombo', state: 'WP', capacity: 2000 }
                  ].map(venue => (
                    <div key={venue.id} className="rounded-2xl border p-4 bg-background shadow-md flex flex-col sm:flex-row items-start sm:items-center" style={{ backgroundColor: darkBg, borderColor: greenBorder }}>
                      <div className="flex-1 min-w-0">
                        <div className="block text-lg font-semibold text-white truncate">{venue.name}</div>
                        <p className="text-sm text-muted-foreground truncate" style={{ color: '#ABA8A9' }}>{venue.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1" style={{ color: '#fff', backgroundColor: '#2a2d34' }}>{venue.city}, {venue.state}</span>
                          <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1" style={{ color: greenBorder, backgroundColor: greenBorder + '20' }}>Capacity: {venue.capacity}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <Button variant="outline" className="flex items-center" style={{ backgroundColor: darkBg, borderColor: greenBorder, color: '#fff' }}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

