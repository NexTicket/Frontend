'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fetchmyVenues, deleteVenue } from '@/lib/api';
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Star,
  MoreVertical,
  Activity,
  Loader2
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  images?: string[];
  featuredImage?: string;
  status?: string;
  totalEvents?: number;
  monthlyRevenue?: number;
  rating?: number;
  lastEvent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VenueOwnerVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch venues on component mount
  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching venues...');
        const response = await fetchmyVenues();
        console.log('Venues response:', response);
        
        // Check if response has data property (based on backend controller)
        if (response.data && Array.isArray(response.data)) {
          // Transform the data to match our Venue interface
          const transformedVenues = response.data.map((venue: any) => ({
            id: venue.id.toString(),
            name: venue.name,
            location: venue.location || 'Location not specified',
            capacity: venue.capacity || 0,
            description: venue.description || 'No description available',
            images: Array.isArray(venue.images) ? venue.images : (venue.image ? [venue.image] : []),
            featuredImage: venue.featuredImage || venue.image || (Array.isArray(venue.images) ? venue.images[0] : '') || '',
            status: 'active', // Default status since it's not in the schema yet
            totalEvents: 0, // Will need to calculate from events table
            monthlyRevenue: 0, // Will need to calculate from bookings
            rating: 0, // Will need to calculate from reviews
            lastEvent: 'No events yet',
            createdAt: venue.createdAt,
            updatedAt: venue.updatedAt
          }));
          
          console.log('Transformed venues:', transformedVenues);
          setVenues(transformedVenues);
        } else {
          console.error('API returned unexpected format:', response);
          setError(response.message || response.error || 'Failed to fetch venues');
        }
      } catch (err: any) {
        console.error('Error fetching venues:', err);
        if (err.message.includes('No user is logged in')) {
          setError('Please log in to view your venues');
        } else if (err.message.includes('Failed to fetch')) {
          setError('Unable to connect to the server. Please check your internet connection.');
        } else {
          setError('Failed to load venues. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  const retryFetch = () => {
    window.location.reload();
  };

  const filteredVenues = venues.filter((venue: Venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || venue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Handle venue deletion with instant UI update
  const handleDeleteVenue = async (venueId: string, venueName: string) => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${venueName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting venue:', venueId);
      
      // Optimistically update the UI immediately
      setVenues(prevVenues => prevVenues.filter(venue => venue.id !== venueId));
      
      // Call the delete API
      await deleteVenue(venueId);
      
      console.log('✅ Venue deleted successfully');
      
      // Show success message (you can replace with a toast if you have one)
      alert(`Venue "${venueName}" has been deleted successfully.`);
      
    } catch (error) {
      console.error('Failed to delete venue:', error);
      
      // If deletion fails, revert the optimistic update by refetching
      try {
        const response = await fetchmyVenues();
        if (response.data && Array.isArray(response.data)) {
          const transformedVenues = response.data.map((venue: any) => ({
            id: venue.id.toString(),
            name: venue.name,
            location: venue.location || 'Location not specified',
            capacity: venue.capacity || 0,
            description: venue.description || 'No description available',
            images: Array.isArray(venue.images) ? venue.images : (venue.image ? [venue.image] : []),
            featuredImage: venue.featuredImage || venue.image || (Array.isArray(venue.images) ? venue.images[0] : '') || '',
            status: 'active',
            totalEvents: 0,
            monthlyRevenue: 0,
            rating: 0,
            lastEvent: 'No events yet',
            createdAt: venue.createdAt,
            updatedAt: venue.updatedAt
          }));
          setVenues(transformedVenues);
        }
      } catch (refetchError) {
        console.error('Failed to refetch venues after delete error:', refetchError);
      }
      
      // Show error message
      alert(`Failed to delete venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
        duration: 0.5
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'maintenance':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
                    My Venues
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex items-center space-x-6"
                  >
                    <div className="h-2 w-24 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full shadow-lg"></div>
                    <p className="text-purple-800 text-xl font-semibold">
                      Elite Collection • {venues.length} Premium Venue{venues.length === 1 ? '' : 's'}
                    </p>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-purple-700/90 text-lg max-w-2xl leading-relaxed"
                  >
                    Manage your premium venue portfolio with sophisticated tools and analytics designed for excellence.
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
                    onClick={retryFetch}
                    disabled={loading}
                    className="relative overflow-hidden group bg-purple-100 hover:bg-purple-200 border border-purple-300 hover:border-purple-400 text-purple-800 hover:text-purple-900 backdrop-blur-sm transition-all duration-300 px-6 py-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-orange-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Loader2 className={`h-5 w-5 mr-3 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                    <span className="relative z-10 font-semibold">Refresh Data</span>
                  </Button>
                  <Link href="/venue-owner/venues/new">
                    <Button className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 border-0 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-orange-400/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Plus className="h-6 w-6 mr-3 relative z-10" />
                      <span className="relative z-10 text-lg">Create Venue</span>
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Elegant Search and Filters */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="backdrop-blur-2xl bg-white/70 border border-orange-200 rounded-3xl p-8 shadow-xl shadow-purple-100">
            <div className="flex flex-col lg:flex-row gap-8">
              <motion.div 
                className="flex-1 relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-purple-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search venues by name, location, or amenities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl text-purple-900 placeholder-purple-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-300 text-lg"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-100/20 to-orange-100/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-purple-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-14 pr-12 py-5 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl text-purple-900 focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-300 appearance-none cursor-pointer text-lg min-w-[200px]"
                >
                  <option value="all" className="bg-white text-purple-900">All Status</option>
                  <option value="active" className="bg-white text-purple-900">Active</option>
                  <option value="maintenance" className="bg-white text-purple-900">Maintenance</option>
                  <option value="inactive" className="bg-white text-purple-900">Inactive</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-400"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Loading State */}
        {loading ? (
          <motion.div variants={itemVariants} className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <motion.div
                  className="w-20 h-20 border-4 border-purple-200 border-t-orange-500 rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <motion.h3 
                className="text-2xl font-bold text-purple-800 mt-8 mb-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Synchronizing Venues...
              </motion.h3>
              <p className="text-purple-600 text-lg">Connecting to your venue network</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div variants={itemVariants} className="text-center py-20">
            <div className="backdrop-blur-xl bg-white/80 border border-red-200 rounded-2xl p-12 max-w-md mx-auto shadow-xl">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Building2 className="h-20 w-20 text-red-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-red-600">Connection Lost</h3>
                <p className="text-purple-700/80 mb-8 leading-relaxed">{error}</p>
                <Button 
                  onClick={retryFetch} 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Reconnect
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredVenues.map((venue: Venue, index: number) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                whileHover={{ 
                  y: -10, 
                  rotateY: 5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                className="group relative backdrop-blur-xl bg-white/90 border border-purple-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-500 transform-gpu perspective-1000"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Animated Border Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500"></div>
                
                {/* Content Container */}
                <div className="relative z-10 h-full">
                  {/* Enhanced Image Section */}
                  <div className="relative h-56 overflow-hidden rounded-t-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-transparent z-10"></div>
                    <img
                      src={venue.featuredImage || venue.images?.[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop'}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md border transition-all duration-300 ${getStatusColor(venue.status || 'active')}`}
                      >
                        {(venue.status || 'active').toUpperCase()}
                      </motion.span>
                    </div>

                    {/* Rating Badge */}
                    {venue.rating && venue.rating > 0 && (
                      <div className="absolute top-4 left-4 z-20 flex items-center space-x-1 backdrop-blur-md bg-white/20 rounded-full px-3 py-2">
                        <Star className="h-4 w-4 fill-current text-orange-400" />
                        <span className="text-sm font-bold text-white">{venue.rating}</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 via-transparent to-orange-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  </div>

                  {/* Enhanced Content */}
                  <div className="p-6 space-y-6">
                    {/* Title and Actions */}
                    <div className="flex items-start justify-between">
                      <motion.h3 
                        className="text-xl font-bold text-purple-900 group-hover:text-orange-600 transition-colors duration-300"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {venue.name}
                      </motion.h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-purple-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="group-hover:text-purple-800 transition-colors duration-300">{venue.location}</span>
                    </div>

                    <p className="text-purple-700/80 text-sm leading-relaxed group-hover:text-purple-800 transition-colors duration-300 line-clamp-2">
                      {venue.description || 'Premium venue space with modern amenities and exceptional service.'}
                    </p>

                    {/* Enhanced Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200 group-hover:border-purple-400 group-hover:bg-white/80 transition-all duration-300"
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                      >
                        <Users className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-lg font-bold text-purple-900">{venue.capacity.toLocaleString()}</p>
                        <p className="text-xs text-purple-600">Capacity</p>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-200 group-hover:border-orange-400 group-hover:bg-white/80 transition-all duration-300"
                        whileHover={{ scale: 1.05, rotateY: -5 }}
                      >
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-lg font-bold text-purple-900">{venue.totalEvents || 0}</p>
                        <p className="text-xs text-purple-600">Events</p>
                      </motion.div>
                    </div>

                    {/* Revenue Display */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-100 via-purple-50 to-orange-50 border border-orange-300 p-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-200/30 to-purple-200/30 opacity-50"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-purple-800">Monthly Revenue</span>
                        </div>
                        <span className="text-xl font-black text-purple-900">
                          ${(venue.monthlyRevenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center text-xs text-purple-500">
                      <Activity className="h-3 w-3 mr-2 text-orange-500" />
                      <span>Last event: {venue.lastEvent || 'Ready for bookings'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Link href={`/venues/${venue.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-white/70 border-purple-200 text-purple-700 hover:bg-white/90 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      
                      <Link href={`/venue-owner/venues/${venue.id}/edit`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-white/70 border-orange-200 text-orange-700 hover:bg-white/90 hover:border-orange-400 transition-all duration-300 backdrop-blur-sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      
                      <Button 
                        onClick={() => handleDeleteVenue(venue.id, venue.name)} 
                        variant="outline" 
                        size="sm" 
                        className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-300 backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Empty State */}
        {!loading && !error && filteredVenues.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-20">
            <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-3xl p-16 max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="relative mb-8">
                  <motion.div
                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-orange-100 to-purple-100 border-2 border-purple-300 flex items-center justify-center"
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Building2 className="h-12 w-12 text-purple-600" />
                  </motion.div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-200/30 to-purple-200/30 rounded-full blur-xl opacity-50"></div>
                </div>
                
                <h3 className="text-3xl font-bold mb-6 text-purple-900">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No Matching Venues' 
                    : 'Your Venue Empire Awaits'
                  }
                </h3>
                
                <p className="text-purple-700 mb-10 text-lg leading-relaxed">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search criteria or filters to find what you\'re looking for' 
                    : 'Ready to build something extraordinary? Create your first venue and start your journey to success.'
                  }
                </p>
                
                {!searchTerm && filterStatus === 'all' && venues.length === 0 && (
                  <Link href="/venue-owner/venues/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                      <Plus className="h-6 w-6 mr-3" />
                      Launch Your First Venue
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
