'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fetchmyVenues } from '@/lib/api';
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
    <div className="p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                My Venues
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and monitor your venues
                {venues.length > 0 && ` (${venues.length} venue${venues.length === 1 ? '' : 's'})`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={retryFetch}
                disabled={loading}
                className="flex items-center"
              >
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : 'hidden'}`} />
                Refresh
              </Button>
              <Link href="/venue-owner/venues/new">
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Venue
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Venues Grid */}
        {loading ? (
          <motion.div variants={itemVariants} className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading your venues...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your venue data.</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div variants={itemVariants} className="text-center py-16">
            <Building2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Venues</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={retryFetch} 
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              Try Again
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredVenues.map((venue: Venue, index: number) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 backdrop-blur-sm rounded-xl border overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={venue.featuredImage || venue.images?.[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop'}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(venue.status || 'active')}`}>
                      {(venue.status || 'active').charAt(0).toUpperCase() + (venue.status || 'active').slice(1)}
                    </span>
                  </div>
                  {venue.rating && venue.rating > 0 && (
                    <div className="absolute top-4 left-4 flex items-center space-x-1 text-white">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="text-sm font-medium">{venue.rating}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{venue.name}</h3>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {venue.location}
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {venue.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-sm font-medium">{venue.capacity}</p>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                    </div>
                    
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-sm font-medium">{venue.totalEvents || 0}</p>
                      <p className="text-xs text-muted-foreground">Events</p>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Monthly Revenue</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      ${(venue.monthlyRevenue || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Activity className="h-3 w-3 mr-1" />
                    Last event: {venue.lastEvent || 'No events yet'}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link href={`/venues/${venue.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    
                    <Link href={`/venue-owner/venues/${venue.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVenues.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by creating your first venue'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && venues.length === 0 && (
              <Link href="/venue-owner/venues/new">
                <Button className="bg-gradient-to-r from-primary to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Venue
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
