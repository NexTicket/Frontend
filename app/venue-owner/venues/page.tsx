'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchmyVenues, deleteVenue } from '@/lib/api';
import { Loading } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ui/error-display';
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
  RefreshCw
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  images?: string[];
  featuredImage?: string;
  amenities?: string[];
  status?: string;
  totalEvents?: number;
  monthlyRevenue?: number;
  rating?: number;
  lastEvent?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export default function VenueOwnerVenues() {
  const { firebaseUser, userProfile, isLoading: authLoading } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch venues on component mount
  useEffect(() => {
    // Don't fetch if still loading auth or user not logged in
    if (authLoading) return;
    
    if (!firebaseUser) {
      setError('Please log in to view your venues');
      setLoading(false);
      return;
    }

    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
            amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
            status: 'active',
            totalEvents: 0,
            monthlyRevenue: 0,
            rating: 0,
            lastEvent: 'No events yet',
            createdAt: venue.createdAt,
            updatedAt: venue.updatedAt
          }));
          
          setVenues(transformedVenues);
        } else {
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
  }, [authLoading, firebaseUser]);

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
    if (!window.confirm(`Are you sure you want to delete "${venueName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setVenues(prevVenues => prevVenues.filter(venue => venue.id !== venueId));
      await deleteVenue(venueId);
      // alert(`Venue "${venueName}" has been deleted successfully.`);
    } catch (error) {
      console.error('Failed to delete venue:', error);
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
            amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
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
      // alert(`Failed to delete venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-green-500 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.h3 
            className="text-2xl font-bold mt-6 mb-4 text-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Authenticating...
          </motion.h3>
          <p >Verifying your credentials</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="backdrop-blur-xl border rounded-2xl p-12 max-w-md mx-auto shadow-xl bg-card border-border">
            <Building2 className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl font-bold mb-4 text-foreground">Authentication Required</h3>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Please log in to access your venue dashboard
            </p>
            <Link href="/auth/signin">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while venues are being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        <Loading
          size="lg"
          text="Loading Your Venues..."
          className="text-white"
        />
      </div>
    );
  }

  // Show error if there was an error loading venues
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" >
        <ErrorDisplay
          type="error"
          title="Failed to Load Venues"
          message={error}
          variant="card"
          onRetry={retryFetch}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-accent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-muted"></div>
      
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
            <div className="border rounded-2xl p-6 shadow-lg bg-primary border-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-3xl font-bold mb-2"
                    style={{ color: '#fff' }}
                  >
                    My Venues
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal"
                    style={{ color: '#fff' }}
                  >
                    Manage your venue portfolio • {venues.length} Venue{venues.length === 1 ? '' : 's'}
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  {/* <Button 
                    onClick={retryFetch}
                    disabled={loading}
                    className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)' }}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button> */}
                  {/* <Link href="/venue-owner/venues/new">
                    <Button className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                      style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Venue
                    </Button>
                  </Link> */}
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="flex h-15 justify-end gap-3">
            <Button 
                    onClick={retryFetch}
                    disabled={loading}
                    className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search venues by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:border-primary transition-all duration-300 bg-background text-foreground border-border placeholder:text-muted-foreground"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl border focus:outline-none focus:border-primary transition-all duration-300 appearance-none bg-background text-foreground border-border"
                  >
                    <option value="all" className="bg-background text-foreground">All Status</option>
                    <option value="active" className="bg-background text-foreground">Active</option>
                    <option value="maintenance" className="bg-background text-foreground">Maintenance</option>
                    <option value="inactive" className="bg-background text-foreground">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {error ? (
            <motion.div variants={itemVariants} className="text-center py-20">
              <div className="backdrop-blur-xl border rounded-2xl p-12 max-w-md mx-auto shadow-xl bg-card border-border">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Building2 className="h-16 w-16 mx-auto mb-6"  />
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Connection Error</h3>
                  <p className="mb-8 leading-relaxed" style={{ color: '#ABA8A9' }}>{error}</p>
                  <Button 
                    onClick={retryFetch} 
                    className="text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
                    
                  >
                    Retry Connection
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredVenues.map((venue: Venue, index: number) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    y: -5, 
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  className="group relative backdrop-blur-xl border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                  style={{ 
                  backgroundColor: 'hsl(var(--card))', 
                    borderColor: '#39FD48' + '50',
                    boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)'
                  }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
                    <img
                      src={venue.featuredImage || venue.images?.[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop'}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium border"
                        style={{ 
                           
                          borderColor: '#39FD48',
                          color: '#39FD48'
                        }}
                      >
                        {venue.status || 'Active'}
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    {venue.rating && venue.rating > 0 && (
                      <div className="absolute top-4 left-4 z-20 flex items-center space-x-1 bg-card/80 backdrop-blur-xl border border-border rounded-full px-3 py-2">
                        <Star className="h-4 w-4 fill-current"  />
                        <span className="text-sm font-bold" style={{ color: '#fff' }}>{venue.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Title and Actions */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold group-hover:opacity-90 transition-opacity duration-300"
                        >
                        {venue.name}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-[#0D6EFD]/20 rounded-full transition-all duration-300"
                        
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm" >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{venue.location}</span>
                    </div>

                    <p className="text-sm leading-relaxed line-clamp-2" >
                      {venue.description || 'Premium venue space with modern amenities and exceptional service.'}
                    </p>

                    {/* Amenities */}
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: '#39FD48' + '20',
                              borderColor: '#39FD48' + '50',
                              color: '#39FD48'
                            }}
                          >
                            {amenity}
                          </span>
                        ))}
                        {venue.amenities.length > 4 && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: '#ABA8A9' + '20',
                              borderColor: '#ABA8A9' + '50',
                              color: '#ABA8A9'
                            }}
                          >
                            +{venue.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-xl border transition-all duration-300"
                        >
                        <Users className="h-5 w-5 mx-auto mb-2"  />
                        <p className="text-lg font-bold" >{venue.capacity.toLocaleString()}</p>
                        <p className="text-xs" >Capacity</p>
                      </div>
                      
                      <div className="text-center p-3 rounded-xl border transition-all duration-300"
                        >
                        <Calendar className="h-5 w-5 mx-auto mb-2"  />
                        <p className="text-lg font-bold" >{venue.totalEvents || 0}</p>
                        <p className="text-xs" >Events</p>
                      </div>
                    </div>

                    {/* Revenue Display */}
                    <div className="relative overflow-hidden rounded-xl border p-4"
                      style={{ borderColor: '#39FD48' + '30' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5"  />
                          <span className="text-sm font-medium">Monthly Revenue</span>
                        </div>
                        <span className="text-lg font-bold" >
                          LKR {(venue.monthlyRevenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center text-xs" >
                      <Activity className="h-3 w-3 mr-2" style={{ color: '#0D6EFD' }} />
                      <span>Last event: {venue.lastEvent || 'Ready for bookings'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Link href={`/venues/${venue.id}`} className="flex-1">
                        <Button 
                           
                          size="sm" 
                          className="w-full  text-white hover:bg-[#0D6EFD] hover:text-white transition-all duration-300" style={{ backgroundColor: '#0D6EFD' }}>
                        
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      
                      <Link href={`/venue-owner/venues/${venue.id}/edit`} className="flex-1">
                        <Button 
                          
                          size="sm" 
                          className="w-full text-white  hover:text-black transition-all duration-300" style={{ backgroundColor: '#0D6EFD' }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      
                      <Button 
                        onClick={() => handleDeleteVenue(venue.id, venue.name)} 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
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
            <motion.div variants={itemVariants} className="text-center py-20">
              <div className="backdrop-blur-xl border rounded-2xl p-16 max-w-2xl mx-auto shadow-xl bg-card border-border">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="relative mb-8">
                    <motion.div
                      className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center"
                      
                      animate={{ 
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Building2 className="h-10 w-10"  />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-6" style={{ color: '#fff' }}>
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No Matching Venues' 
                      : 'Your Venue Portfolio Awaits'
                    }
                  </h3>
                  
                  <p className="mb-10 text-lg leading-relaxed" >
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search criteria or filters to find what you\'re looking for' 
                      : 'Ready to build something extraordinary? Create your first venue and start your journey.'
                    }
                  </p>
                  
                  {!searchTerm && filterStatus === 'all' && venues.length === 0 && (
                    <Link href="/venue-owner/venues/new">
                      <Button className="text-white font-bold px-10 py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-lg"
                        >
                        <Plus className="h-6 w-6 mr-3" />
                        Create Your First Venue
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
