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
  MoreVertical
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
  { name: 'Concerts', value: 35, color: '#8884d8' },
  { name: 'Sports', value: 25, color: '#82ca9d' },
  { name: 'Theater', value: 20, color: '#ffc658' },
  { name: 'Comedy', value: 12, color: '#ff7300' },
  { name: 'Other', value: 8, color: '#00ff88' }
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
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative backdrop-blur-xl bg-white/80 border border-purple-200/50 rounded-2xl p-6 shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-purple-50/30 to-orange-50/30 rounded-2xl"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-purple-600/80 text-sm font-medium mb-2">{title}</p>
            <div className="text-3xl font-black text-purple-900 mb-1">{value}</div>
            {subtitle && (
              <p className="text-purple-500/70 text-xs">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <TrendIcon size={14} className={trendColor} />
                <span className={`text-xs ml-1 font-medium ${trendColor}`}>
                  {Math.abs(trend)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-orange-100 rounded-xl p-3 shadow-lg">
            {icon}
          </div>
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
  console.log('User profile after admin redirectory:', userProfile);

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
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-800 text-lg font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!firebaseUser || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-3xl p-8 shadow-2xl shadow-purple-100 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-purple-900 mb-4">Access Denied</h1>
          <p className="text-purple-700 mb-6">
            You need admin privileges to access this page.
          </p>
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
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
      icon: <Users size={24} className="text-purple-600" />,
      trend: 12.5,
      color: '#8b5cf6',
      subtitle: '145 new this week'
    },
    {
      title: 'Active Events',
      value: '186',
      icon: <Calendar size={24} className="text-orange-600" />,
      trend: 8.2,
      color: '#ea580c',
      subtitle: '23 ending soon'
    },
    {
      title: 'Monthly Revenue',
      value: 'LKR 847K',
      icon: <DollarSign size={24} className="text-green-600" />,
      trend: 15.8,
      color: '#16a34a',
      subtitle: 'Target: LKR 1M'
    },
    {
      title: 'Tickets Sold',
      value: '12,493',
      icon: <Activity size={24} className="text-blue-600" />,
      trend: 23.1,
      color: '#2563eb',
      subtitle: '1,847 today'
    },
    {
      title: 'Active Venues',
      value: '67',
      icon: <MapPin size={24} className="text-red-600" />,
      trend: 5.4,
      color: '#dc2626',
      subtitle: '12 pending approval'
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      icon: <Star size={24} className="text-yellow-600" />,
      trend: 2.1,
      color: '#ca8a04',
      subtitle: 'From 2,847 reviews'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
      
      {/* Content Container */}
      <div className="relative z-10 pt-8 px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Elegant Header */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="relative backdrop-blur-xl bg-white/80 border border-purple-200 rounded-3xl p-12 shadow-2xl shadow-purple-100">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-purple-50/50 to-orange-50/50 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-6">
                    <motion.h1 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="text-7xl font-black text-purple-900 leading-tight"
                    >
                      Admin Dashboard
                    </motion.h1>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="flex items-center space-x-6"
                    >
                      <div className="h-2 w-24 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full shadow-lg"></div>
                      <p className="text-purple-800 text-xl font-semibold">
                        System Control • Welcome back, {userProfile.firstName || 'Admin'}!
                      </p>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-purple-700/90 text-lg max-w-2xl leading-relaxed"
                    >
                      Monitor and manage your NexTicket platform with comprehensive analytics and control tools designed for administrators.
                    </motion.p>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center space-x-6"
                  >
                    <Button 
                      variant="ghost" 
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="relative overflow-hidden group bg-purple-100 hover:bg-purple-200 border border-purple-300 hover:border-purple-400 text-purple-800 hover:text-purple-900 backdrop-blur-sm transition-all duration-300 px-6 py-4"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-orange-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <RefreshCw className={`h-5 w-5 mr-3 relative z-10 ${refreshing ? 'animate-spin' : ''}`} />
                      <span className="relative z-10 font-semibold">Refresh Data</span>
                    </Button>
                    <Button 
                      onClick={() => router.push('/admin/users')}
                      className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 border-0 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-orange-400/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Users className="h-6 w-6 mr-3 relative z-10" />
                      <span className="relative z-10 text-lg">Manage Users</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* System Alert */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="backdrop-blur-xl bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-800 font-semibold">System Maintenance Notice</h3>
                  <p className="text-amber-700">Scheduled maintenance on July 25, 2025 from 2:00 AM - 4:00 AM LKT</p>
                </div>
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Review
                </Button>
              </div>
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
              {/* Quick Actions Dashboard */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Analytics Chart */}
              <div className="lg:col-span-2 backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-8 shadow-xl shadow-purple-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-purple-900">Revenue Analytics</h3>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-600 text-sm font-medium">Monthly View</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="backdrop-blur-xl bg-white/80 border border-orange-200 rounded-2xl p-8 shadow-xl shadow-orange-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-orange-900">Live Activities</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {recentActivities.slice(0, 6).map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-purple-50/50 transition-colors duration-200">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-purple-900 truncate">{activity.user}</p>
                        <p className="text-xs text-purple-600 truncate">{activity.action}</p>
                        {activity.event && (
                          <p className="text-xs text-orange-600 font-medium truncate">{activity.event}</p>
                        )}
                        <p className="text-xs text-purple-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => setActivityDialogOpen(true)}
                >
                  View All Activities
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Top Events Performance */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-8 shadow-xl shadow-purple-100/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-purple-900">Top Performing Events</h3>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-orange-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-200">
                      <th className="text-left py-4 px-6 text-purple-800 font-semibold">Event Name</th>
                      <th className="text-left py-4 px-6 text-purple-800 font-semibold">Tickets Sold</th>
                      <th className="text-left py-4 px-6 text-purple-800 font-semibold">Revenue</th>
                      <th className="text-left py-4 px-6 text-purple-800 font-semibold">Growth</th>
                      <th className="text-left py-4 px-6 text-purple-800 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEvents.map((event, index) => (
                      <tr key={event.id} className="border-b border-purple-100 hover:bg-purple-50/30 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-purple-900">{event.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-purple-800">{event.tickets.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-green-600">LKR {event.revenue.toLocaleString()}</div>
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
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <MoreVertical className="h-4 w-4" />
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

          {/* Quick Action Buttons */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Button 
                onClick={() => router.push('/admin/users')}
                className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Users className="h-8 w-8 mr-3" />
                Manage Users
              </Button>
              <Button 
                onClick={() => router.push('/admin/events')}
                className="h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Calendar className="h-8 w-8 mr-3" />
                Manage Events
              </Button>
              <Button 
                onClick={() => router.push('/admin/venues')}
                className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <MapPin className="h-8 w-8 mr-3" />
                Manage Venues
              </Button>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`h-8 w-8 mr-3 ${refreshing ? 'animate-spin' : ''}`} />
                System Refresh
              </Button>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

