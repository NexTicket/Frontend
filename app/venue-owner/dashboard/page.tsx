'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchmyVenues } from '@/lib/api';
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
  RefreshCw,
  Loader2
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
// Interfaces
// Interfaces
interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  image?: string;
  description?: string;
  amenities?: string[];
  totalEvents?: number;
  rating?: number;
}

interface VenueStats {
  totalVenues: number;
  activeVenues: number;
  totalEvents: number;
  monthlyRevenue: number;
  avgOccupancy: number;
  totalCapacity: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  subtitle?: string;
}

// StatCard Component
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, subtitle }) => {
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
          <div className="text-primary">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function VenueOwnerDashboard() {
  const { firebaseUser, isLoading: authLoading } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [stats, setStats] = useState<VenueStats>({
    totalVenues: 0,
    activeVenues: 0,
    totalEvents: 0,
    monthlyRevenue: 0,
    avgOccupancy: 0,
    totalCapacity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadVenues = async () => {
      if (authLoading) return;
      
      if (!firebaseUser) {
        setLoading(false);
        setError('Please sign in to view your dashboard');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchmyVenues();
        
        // Transform venue data
        const transformedVenues: Venue[] = response.data.map((venue: any) => ({
          id: venue.id.toString(),
          name: venue.name || 'Unnamed Venue',
          location: venue.location || 'Location not specified',
          capacity: parseInt(venue.capacity?.toString() || '0'),
          status: venue.status || 'active',
          image: venue.images?.[0] || venue.image || '/Images/events/banners/m1.jpeg',
          description: venue.description || '',
          amenities: venue.amenities || [],
          totalEvents: venue.totalEvents || 0,
          rating: venue.rating || 4.5
        }));

        setVenues(transformedVenues);

        // Calculate real stats from venue data
        const activeVenues = transformedVenues.filter((v: Venue) => v.status === 'active').length;
        const totalEvents = transformedVenues.reduce((sum: number, v: Venue) => sum + (v.totalEvents || 0), 0);
        const totalCapacity = transformedVenues.reduce((sum: number, v: Venue) => sum + v.capacity, 0);
        const avgOccupancy = transformedVenues.length > 0 
          ? Math.round((activeVenues / transformedVenues.length) * 100) 
          : 0;

        setStats({
          totalVenues: transformedVenues.length,
          activeVenues,
          totalEvents,
          monthlyRevenue: totalEvents * 5000, // Estimate based on events
          avgOccupancy,
          totalCapacity
        });
      } catch (err) {
        console.error('Error fetching venues:', err);
        setError('Failed to load venues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, [firebaseUser, authLoading]);

  // Recent activity mock data (can be replaced with real API later)
  const recentActivity = [
    {
      id: '1',
      type: 'booking',
      venue: venues[0]?.name || 'Venue',
      event: 'Recent Event',
      date: new Date().toISOString().split('T')[0],
      revenue: 15000,
    },
    {
      id: '2',
      type: 'update',
      venue: venues[1]?.name || 'Venue',
      description: 'Venue details updated',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetchmyVenues();
      const transformedVenues: Venue[] = response.data.map((venue: any) => ({
        id: venue.id.toString(),
        name: venue.name || 'Unnamed Venue',
        location: venue.location || 'Location not specified',
        capacity: parseInt(venue.capacity?.toString() || '0'),
        status: venue.status || 'active',
        image: venue.images?.[0] || venue.image || '/Images/events/banners/m1.jpeg',
        description: venue.description || '',
        amenities: venue.amenities || [],
        totalEvents: venue.totalEvents || 0,
        rating: venue.rating || 4.5
      }));
      setVenues(transformedVenues);
    } catch (err) {
      console.error('Error refreshing venues:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const venueStats = [
    {
      title: 'Total Venues',
      value: stats.totalVenues,
      icon: <Building2 size={24} />,
      trend: 12.5,
      color: '#000',
      subtitle: `${stats.activeVenues} active venues`
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: <Calendar size={24} />,
      trend: 8.2,
      color: '#000',
      subtitle: 'All time events'
    },
    {
      title: 'Monthly Revenue',
      value: `LKR ${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
      icon: <DollarSign size={24} />,
      trend: 15.8,
      color: '#000',
      subtitle: 'Estimated from events'
    },
    {
      title: 'Avg. Rating',
      value: venues.length > 0 ? (venues.reduce((sum: number, v: Venue) => sum + (v.rating || 0), 0) / venues.length).toFixed(1) : '0.0',
      icon: <Star size={24} />,
      trend: 2.1,
      color: '#000',
      subtitle: `From ${venues.length} venues`
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.avgOccupancy}%`,
      icon: <TrendingUp size={24} />,
      trend: 5.4,
      color: '#000',
      subtitle: 'Venue utilization'
    },
    {
      title: 'Total Capacity',
      value: stats.totalCapacity,
      icon: <Activity size={24} />,
      trend: 23.1,
      color: '#000',
      subtitle: 'Combined seats'
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
                    Venue Owner Dashboard
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal text-primary-foreground"
                  >
                    Welcome back! Manage your venues and track performance.
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl bg-card hover:bg-card/80 text-card-foreground"
              >
                <RefreshCw className={`h-8 w-8 mr-3 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Venues
              </Button>
              <Link href="/venue-owner/venues/new">
                <Button className="w-full h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-8 w-8 mr-3" />
                  Add New Venue
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venueStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Venues */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-foreground">My Venues</h2>
                  <Link href="/venue-owner/venues">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="transition-all duration-200 hover:shadow-md border-border text-foreground bg-transparent hover:bg-accent/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading venues...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-500 mb-4">{error}</p>
                      <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  ) : venues.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No venues found</p>
                      <Link href="/venue-owner/venues/new">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Venue
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    venues.map((venue: Venue, index: number) => (
                      <motion.div
                        key={venue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={venue.image}
                              alt={venue.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div 
                              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                                venue.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            ></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg text-foreground">{venue.name}</h3>
                              <div className="flex items-center space-x-1 text-foreground">
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                                <span className="text-sm font-medium">{venue.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-sm mt-1 text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {venue.location}
                              <Users className="h-4 w-4 ml-4 mr-1" />
                              {venue.capacity} capacity
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-foreground font-medium">
                                  {venue.totalEvents || 0} events
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  venue.status === 'active' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                  {venue.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Link href={`/venues/${venue.id}`}>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/venue-owner/venues/${venue.id}/edit`}>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card text-card-foreground">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Recent Activity</h2>
                
                <div className="space-y-4">
                  {recentActivity.map((activity: any, index: number) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-4 rounded-xl transition-colors duration-200 hover:bg-accent/20 bg-card border border-border"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                        {activity.type === 'booking' ? (
                          <Calendar className="h-5 w-5 text-primary" />
                        ) : (
                          <Activity className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.type === 'booking' ? (
                            <>
                              New booking at <span className="text-primary font-semibold">{activity.venue}</span>
                            </>
                          ) : (
                            <>
                              {activity.description} at <span className="text-primary font-semibold">{activity.venue}</span>
                            </>
                          )}
                        </p>
                        {activity.event && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Event: {activity.event}
                          </p>
                        )}
                        <div className="flex items-center text-xs mt-1 text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.date}
                          {activity.revenue && (
                            <>
                              <span className="mx-2">•</span>
                              <DollarSign className="h-3 w-3 mr-1" />
                              LKR {activity.revenue.toLocaleString()}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                {/* <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-medium mb-4 text-foreground">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/venue-owner/venues/new">
                      <Button className="w-full justify-start">
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