'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Star,
  Activity,
  RefreshCw
} from 'lucide-react';

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

// Mock data for now - replace with actual API calls
const mockVenueOwnerData = {
  venues: [
    {
      id: '1',
      name: 'Grand Theater',
      location: 'Downtown',
      capacity: 500,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?w=400&h=300&fit=crop',
      status: 'active',
      totalEvents: 12,
      monthlyRevenue: 25000,
      rating: 4.8,
      occupancyRate: 85,
      recentBookings: 8
    },
    {
      id: '2',
      name: 'Conference Center',
      location: 'Business District',
      capacity: 200,
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
      status: 'active',
      totalEvents: 8,
      monthlyRevenue: 15000,
      rating: 4.6,
      occupancyRate: 72,
      recentBookings: 5
    }
  ],
  stats: {
    totalVenues: 2,
    totalEvents: 20,
    monthlyRevenue: 40000,
    occupancyRate: 85,
    avgRating: 4.7,
    totalBookings: 156
  },
  recentActivity: [
    { id: 1, user: 'Sarah Johnson', action: 'Booked venue', venue: 'Grand Theater', time: '2 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
    { id: 2, user: 'Mike Chen', action: 'Left 5-star review', venue: 'Conference Center', time: '5 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
    { id: 3, user: 'Emma Wilson', action: 'Made payment', venue: 'Grand Theater', time: '15 min ago', avatar: '/Images/profile-avatar-account-icon.png' },
    { id: 4, user: 'James Brown', action: 'Cancelled booking', venue: 'Conference Center', time: '1 hour ago', avatar: '/Images/profile-avatar-account-icon.png' }
  ]
};

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

export default function VenueOwnerDashboard() {
  const [venues, setVenues] = useState(mockVenueOwnerData.venues);
  const [stats, setStats] = useState(mockVenueOwnerData.stats);
  const [recentActivity, setRecentActivity] = useState(mockVenueOwnerData.recentActivity);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const venueStats = [
    {
      title: 'Total Venues',
      value: stats.totalVenues,
      icon: <Building2 size={24} style={{ color: '#CBF83E' }} />,
      trend: 12.5,
      color: '#CBF83E',
      subtitle: `${venues.filter(v => v.status === 'active').length} active venues`
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: <Calendar size={24} style={{ color: '#CBF83E' }} />,
      trend: 8.2,
      color: '#CBF83E',
      subtitle: `${venues.reduce((sum, v) => sum + v.recentBookings, 0)} this week`
    },
    {
      title: 'Monthly Revenue',
      value: `LKR ${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
      icon: <DollarSign size={24} style={{ color: '#CBF83E' }} />,
      trend: 15.8,
      color: '#CBF83E',
      subtitle: 'Target: LKR 50K'
    },
    {
      title: 'Avg. Rating',
      value: stats.avgRating,
      icon: <Star size={24} style={{ color: '#CBF83E' }} />,
      trend: 2.1,
      color: '#CBF83E',
      subtitle: `From ${stats.totalBookings} bookings`
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: <TrendingUp size={24} style={{ color: '#CBF83E' }} />,
      trend: 5.4,
      color: '#CBF83E',
      subtitle: 'Above industry avg'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <Activity size={24} style={{ color: '#CBF83E' }} />,
      trend: 23.1,
      color: '#CBF83E',
      subtitle: `${venues.reduce((sum, v) => sum + v.recentBookings, 0)} today`
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: '#191C24' }}>
      {/* Background Elements */}
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
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12 h-25">
            <div className="border rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#0D6EFD', borderColor: '#000' }}>
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-3xl font-bold mb-2"
                    style={{ color: '#fff' }}
                  >
                    Venue Owner Dashboard
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal"
                    style={{ color: '#fff' }}
                  >
                    Welcome back! Manage your venues and track performance.
                  </motion.p>
                </div>
                {/* <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  <Button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)' }}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Link href="/venue-owner/venues/new">
                    <Button className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                      style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Venue
                    </Button>
                  </Link>
                </motion.div> */}
              </div>
            </div>
          </motion.div>

          <div className="flex h-18 justify-end gap-3">
  <Button
    onClick={handleRefresh}
    disabled={refreshing}
    className="px-4 py-1 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
    style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)' }}
  >
    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
    Refresh
  </Button>

  <Link href="/venue-owner/venues/new">
                    <Button className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                      style={{ background: '#0D6EFD' }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Venue
                    </Button>
                  </Link>
</div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {venueStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Venues */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
                style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold" style={{ color: '#fff' }}>My Venues</h2>
                  <Link href="/venue-owner/venues">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#39FD48] text-[#39FD48] hover:bg-[#39FD48] hover:text-black"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {venues.map((venue, index) => (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                      style={{ backgroundColor: '#0D6EFD' + '20', borderColor: '#0D6EFD' + '30' }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={venue.image}
                            alt={venue.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#39FD48] rounded-full border-2 border-[#191C24]"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg" style={{ color: '#fff' }}>{venue.name}</h3>
                            <div className="flex items-center space-x-1 text-[#39FD48]">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-medium">{venue.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm mt-1" style={{ color: '#ABA8A9' }}>
                            <MapPin className="h-4 w-4 mr-1" />
                            {venue.location}
                            <Users className="h-4 w-4 ml-4 mr-1" />
                            {venue.capacity} capacity
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-[#39FD48] font-medium">
                                {venue.totalEvents} events
                              </span>
                              <span className="text-[#0D6EFD] font-medium">
                                LKR {venue.monthlyRevenue.toLocaleString()}/mo
                              </span>
                              <span className="font-medium" style={{ color: '#ABA8A9' }}>
                                {venue.occupancyRate}% occupied
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/venues/${venue.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-[#ABA8A9] hover:text-[#39FD48] hover:bg-[#39FD48]/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/venue-owner/venues/${venue.id}/edit`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-[#ABA8A9] hover:text-[#0D6EFD] hover:bg-[#0D6EFD]/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
                style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: '#fff' }}>Recent Activity</h2>
                
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: '#0D6EFD' + '10' }}
                    >
                      <img
                        src={activity.avatar}
                        alt={activity.user}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#fff' }}>
                          <span className="text-white">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs" style={{ color: '#0D6EFD' }}>
                          {activity.venue}
                        </p>
                        <div className="flex items-center text-xs mt-1" style={{ color: '#ABA8A9' }}>
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                {/* <div className="mt-6 pt-6 border-t" style={{ borderColor: '#39FD48' + '20' }}>
                  <h3 className="text-lg font-medium mb-4" style={{ color: '#fff' }}>Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/venue-owner/venues/new">
                      <Button className="w-full justify-start text-white hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Venue
                      </Button>
                    </Link>
                    <Link href="/venue-owner/analytics">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-[#0D6EFD] text-[#0D6EFD] hover:bg-[#0D6EFD] hover:text-white"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                    <Link href="/venue-owner/settings">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-[#ABA8A9] text-[#ABA8A9] hover:bg-[#ABA8A9] hover:text-black"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div> */}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}