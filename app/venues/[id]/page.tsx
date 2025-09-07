"use client"
import React from 'react';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Calendar,
  ArrowLeft,
  Star,
  Share2,
  Heart,
  Clock,
  Ticket,
  Building2,
  Camera,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Shield,
  Accessibility,
  Volume2,
  Monitor,
  Grid3X3,
  Layout,
  Eye,
  RefreshCw,
  Activity
} from 'lucide-react';
import { fetchVenueById, fetchVenueSeatMap, fetchEventsByVenueId } from '@/lib/api';
import { mockSeats } from '@/lib/mock-data';

interface VenueDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Animation variants
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

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatingLayout, setSeatingLayout] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const loadVenue = async () => {
      try {
        setLoading(true);
        console.log('Loading venue with ID:', id);
        
        const venueData = await fetchVenueById(id);
        console.log('Venue data received:', venueData);
        
        if (venueData && venueData.data) {
          setVenue(venueData.data);
          
          // Log the seatMap structure for debugging
          console.log('Venue seatMap:', venueData.data.seatMap);

          // Try to fetch seat map from database first
          try {
            console.log('Fetching seat map for venue:', id);
            const seatMapData = await fetchVenueSeatMap(id);
            console.log('Seat map data received:', seatMapData);
            
            if (seatMapData && seatMapData.seatMap) {
              // Process seat map from database
              const processedSeats = Array.isArray(seatMapData.seatMap) 
                ? seatMapData.seatMap 
                : Object.values(seatMapData.seatMap || {}).flat();
              
              console.log('Processed seats:', processedSeats);
              setSeatingLayout(processedSeats);
            } else {
              console.log('No separate seat map found, checking venue.seatMap');
              // Check if venue itself has seatMap structure
              if (venueData.data.seatMap) {
                console.log('Using venue.seatMap data');
                // For the new seatMap structure, we don't need to process into individual seats
                // The visualization will be handled directly in the render
                setSeatingLayout([]);
              } else {
                console.log('No seat map found, generating fallback seating');
                // Fallback to generated seating
                const generatedSeats = generateSeatingLayout(venueData.data);
                setSeatingLayout(generatedSeats);
              }
            }
          } catch (seatMapError) {
            console.error('Failed to load seat map:', seatMapError);
            console.log('Using fallback seating generation');
            // Fallback to generated seating
            const generatedSeats = generateSeatingLayout(venueData.data);
            setSeatingLayout(generatedSeats);
          }

          // Load events for this venue
          try {
            setEventsLoading(true);
            console.log('Fetching events for venue:', id);
            const eventsData = await fetchEventsByVenueId(id);
            console.log('Events data received:', eventsData);
            
            if (eventsData && eventsData.data) {
              setUpcomingEvents(eventsData.data);
            }
          } catch (eventsError) {
            console.error('Failed to load events for venue:', eventsError);
            setUpcomingEvents([]);
          } finally {
            setEventsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading venue:', err);
        setError(err instanceof Error ? err.message : 'Failed to load venue');
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
  }, [id]);

  // Fallback seat generation if no real data is available
  const generateSeatingLayout = (venue: any) => {
    const capacity = venue?.capacity || 200;
    const sections = ['Orchestra', 'Balcony', 'Mezzanine'];
    const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const seatsPerRow = Math.ceil(capacity / (sections.length * 8));
    
    let seatId = 1;
    const layout: Array<{
      id: string;
      section: string;
      row: string;
      number: number;
      isAvailable: boolean;
      price: number;
    }> = [];
    
    sections.forEach(section => {
      for (let rowIndex = 0; rowIndex < 8 && seatId <= capacity; rowIndex++) {
        for (let seatNum = 1; seatNum <= seatsPerRow && seatId <= capacity; seatNum++) {
          layout.push({
            id: `seat-${seatId}`,
            section,
            row: rows[rowIndex],
            number: seatNum,
            isAvailable: Math.random() > 0.2,
            price: section === 'Orchestra' ? 120 : section === 'Balcony' ? 85 : 65
          });
          seatId++;
        }
      }
    });
    
    return layout;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#191C24' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              className="w-20 h-20 border-4 border-[#0D6EFD] border-t-[#39FD48] rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.h3 
              className="text-2xl font-bold mt-6 mb-4"
              style={{ color: '#fff' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading Venue Details...
            </motion.h3>
            <p style={{ color: '#ABA8A9' }}>Fetching venue information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen" style={{ background: '#191C24' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center backdrop-blur-xl border rounded-2xl p-12 max-w-md mx-auto shadow-xl"
            style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}
          >
            <Building2 className="h-16 w-16 mx-auto mb-6" style={{ color: '#39FD48' }} />
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Venue Not Found</h1>
            <p className="mb-6" style={{ color: '#ABA8A9' }}>{error || 'The venue you\'re looking for doesn\'t exist'}</p>
            <Link href="/venues">
              <Button className="text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Venues
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'seating', label: 'Seating Layout' },
    { id: 'events', label: `Events (${upcomingEvents.length})` },
    { id: 'amenities', label: 'Amenities' },
    { id: 'contact', label: 'Contact' }
  ];

  // Group seating layout by section with robust data handling
  const groupedSeats = seatingLayout.reduce((acc: any, seat) => {
    // Ensure seat has required properties with fallbacks
    const sectionName = seat.section || seat.sectionName || 'General';
    const rowName = seat.row || seat.rowName || seat.rowId || 'A';
    
    if (!acc[sectionName]) {
      acc[sectionName] = {};
    }
    if (!acc[sectionName][rowName]) {
      acc[sectionName][rowName] = [];
    }
    
    // Normalize seat data structure
    const normalizedSeat = {
      id: seat.id || seat.seatId || `seat-${seat.number || Math.random()}`,
      section: sectionName,
      row: rowName,
      number: seat.number || seat.seatNumber || 1,
      isAvailable: seat.isAvailable !== undefined ? seat.isAvailable : seat.available !== undefined ? seat.available : true,
      price: seat.price || seat.ticketPrice || 50,
      type: seat.type || seat.seatType || 'standard'
    };
    
    acc[sectionName][rowName].push(normalizedSeat);
    return acc;
  }, {});

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
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <Link href="/venues" className="inline-flex items-center font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#39FD48' }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venues
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="backdrop-blur-xl border rounded-2xl overflow-hidden shadow-xl" 
              style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
              
              {/* Venue Image */}
              <div className="relative h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
                {venue.featuredImage || venue.image ? (
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    src={venue.featuredImage || venue.image} 
                    alt={venue.name || 'Venue'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" 
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #39FD48)' }}>
                    <Building2 className="h-24 w-24 text-white opacity-80" />
                  </div>
                )}
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-6 right-6 z-20 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className="backdrop-blur-md hover:bg-white/20 rounded-full"
                    style={{ backgroundColor: 'rgba(25, 28, 36, 0.8)' }}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="backdrop-blur-md hover:bg-white/20 rounded-full"
                    style={{ backgroundColor: 'rgba(25, 28, 36, 0.8)' }}
                  >
                    <Share2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>

              {/* Venue Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <motion.h1 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-4xl md:text-5xl font-bold mb-3"
                      style={{ color: '#fff' }}
                    >
                      {venue.name || 'Unnamed Venue'}
                    </motion.h1>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center mb-3"
                      style={{ color: '#ABA8A9' }}
                    >
                      <MapPin className="h-5 w-5 mr-2" style={{ color: '#39FD48' }} />
                      {venue.location || 'Location not specified'}
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center space-x-6 text-sm mb-4"
                      style={{ color: '#ABA8A9' }}
                    >
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" style={{ color: '#0D6EFD' }} />
                        Capacity: {venue.capacity ? Number(venue.capacity).toLocaleString() : 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-current mr-1" style={{ color: '#39FD48' }} />
                        4.8 (127 reviews)
                      </div>
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-1" style={{ color: '#0D6EFD' }} />
                        Active
                      </div>
                    </motion.div>
                    
                    {venue.tenant && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center px-4 py-2 rounded-xl border"
                        style={{ 
                          backgroundColor: '#0D6EFD' + '20', 
                          borderColor: '#0D6EFD' + '30',
                          color: '#fff'
                        }}
                      >
                        <Building2 className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
                        <strong>Managed by:</strong> &nbsp;{venue.tenant.name}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="backdrop-blur-xl border rounded-2xl shadow-xl" 
              style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}>
              <nav className="flex space-x-1 relative p-2">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-white shadow-md'
                        : 'hover:opacity-80'
                    }`}
                    style={{ 
                      background: activeTab === tab.id 
                        ? '#0D6EFD' 
                        : 'transparent',
                      color: activeTab === tab.id ? '#fff' : '#ABA8A9'
                    }}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* About Section */}
                    <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                      style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                      <h3 className="text-2xl font-bold mb-6" style={{ color: '#fff' }}>About This Venue</h3>
                      <p className="leading-relaxed text-lg" style={{ color: '#ABA8A9' }}>
                        {venue.description || 'Experience premium entertainment in a world-class venue designed for unforgettable moments. Our state-of-the-art facilities and exceptional service create the perfect atmosphere for every event.'}
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all duration-500" 
                        style={{ backgroundColor: '#191C24', borderColor: '#0D6EFD' + '50' }}>
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                            <Volume2 className="h-6 w-6" style={{ color: '#0D6EFD' }} />
                          </div>
                          <h4 className="text-xl font-bold" style={{ color: '#fff' }}>Audio & Visual</h4>
                        </div>
                        <ul className="space-y-2" style={{ color: '#ABA8A9' }}>
                          <li>• Professional sound system</li>
                          <li>• HD projection capabilities</li>
                          <li>• Stage lighting system</li>
                          <li>• Wireless microphones</li>
                        </ul>
                      </div>

                      <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all duration-500" 
                        style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}>
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#39FD48' + '20' }}>
                            <Accessibility className="h-6 w-6" style={{ color: '#39FD48' }} />
                          </div>
                          <h4 className="text-xl font-bold" style={{ color: '#fff' }}>Accessibility</h4>
                        </div>
                        <ul className="space-y-2" style={{ color: '#ABA8A9' }}>
                          <li>• Wheelchair accessible</li>
                          <li>• Hearing loop system</li>
                          <li>• Reserved seating areas</li>
                          <li>• Accessible restrooms</li>
                        </ul>
                      </div>

                      <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all duration-500" 
                        style={{ backgroundColor: '#191C24', borderColor: '#0D6EFD' + '50' }}>
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                            <Car className="h-6 w-6" style={{ color: '#0D6EFD' }} />
                          </div>
                          <h4 className="text-xl font-bold" style={{ color: '#fff' }}>Transportation</h4>
                        </div>
                        <ul className="space-y-2" style={{ color: '#ABA8A9' }}>
                          <li>• Parking available</li>
                          <li>• Public transit access</li>
                          <li>• Rideshare pickup zone</li>
                          <li>• Bicycle parking</li>
                        </ul>
                      </div>

                      <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all duration-500" 
                        style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}>
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#39FD48' + '20' }}>
                            <Utensils className="h-6 w-6" style={{ color: '#39FD48' }} />
                          </div>
                          <h4 className="text-xl font-bold" style={{ color: '#fff' }}>Amenities</h4>
                        </div>
                        <ul className="space-y-2" style={{ color: '#ABA8A9' }}>
                          <li>• Full service bar</li>
                          <li>• Catering available</li>
                          <li>• VIP lounges</li>
                          <li>• Gift shop</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'seating' && (
                  <div className="space-y-8">
                    {/* Seating Overview */}
                    <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                      style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold" style={{ color: '#fff' }}>Seating Layout</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm" style={{ color: '#ABA8A9' }}>Section Layout Overview</span>
                        </div>
                      </div>

                      {/* Debug Info */}
                      <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                        <p style={{ color: '#ABA8A9', fontSize: '12px' }}>
                          Debug: {seatingLayout.length > 0 ? `Found ${seatingLayout.length} seats` : 'No seating data found'}
                        </p>
                      </div>

                      {/* Stage */}
                      <div className="rounded-xl p-6 mb-8 text-center" style={{ background: 'linear-gradient(135deg, #0D6EFD, #39FD48)' }}>
                        <h4 className="text-xl font-bold text-white">🎭 STAGE</h4>
                      </div>

                      {/* Render SeatMap based on database structure */}
                      {venue?.seatMap && (
                        <div className="space-y-6">
                          {/* Sections Legend */}
                          <div className="flex flex-wrap gap-4 justify-center">
                            {venue.seatMap.sections?.map((section: any) => (
                              <div key={section.id} className="flex items-center space-x-2 px-3 py-2 rounded-lg border"
                                style={{ backgroundColor: section.color + '20', borderColor: section.color + '50' }}>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: section.color }}></div>
                                <span className="text-sm font-medium" style={{ color: '#fff' }}>
                                  {section.name} (×{section.price_multiplier})
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Seat Grid Visualization */}
                          <div className="flex justify-center">
                            <div className="inline-block p-6 rounded-xl border" 
                              style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                              <div 
                                className="grid gap-1"
                                style={{
                                  gridTemplateColumns: `repeat(${venue.seatMap.columns || 10}, 1fr)`
                                }}
                              >
                                {Array.from({ length: venue.seatMap.rows * venue.seatMap.columns }).map((_, index) => {
                                  const row = Math.floor(index / venue.seatMap.columns);
                                  const col = index % venue.seatMap.columns;
                                  
                                  // Find which section this seat belongs to
                                  const section = venue.seatMap.sections?.find((s: any) => 
                                    row >= s.startRow && row < s.startRow + s.rows &&
                                    col >= s.startCol && col < s.startCol + s.columns
                                  );

                                  const isAisle = venue.seatMap.aisles?.includes(row);
                                  // const isWheelchairAccessible = venue.seatMap.wheelchair_accessible?.includes(row);

                                  return (
                                    <div
                                      key={`${row}-${col}`}
                                      className={`w-6 h-6 rounded-sm transition-all duration-200 cursor-pointer hover:scale-110 flex items-center justify-center text-xs font-bold ${
                                        isAisle ? 'opacity-50' : ''
                                      }`}
                                      style={{
                                        backgroundColor: section ? section.color : '#39FD48',
                                        opacity: section ? 1 : 0.3,
                                        // border: isWheelchairAccessible ? '2px solid #FFF' : 'none'
                                      }}
                                      title={`Row ${row + 1}, Seat ${col + 1}${section ? ` - ${section.name}` : ''}`}
                                    >
                                      {/* {isWheelchairAccessible ? '♿' : col + 1} */}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Seating Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl border"
                              style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                              <div className="text-2xl font-bold" style={{ color: '#39FD48' }}>
                                {venue.seatMap.rows * venue.seatMap.columns}
                              </div>
                              <div className="text-sm" style={{ color: '#ABA8A9' }}>Total Seats</div>
                            </div>
                            <div className="text-center p-4 rounded-xl border"
                              style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                              <div className="text-2xl font-bold" style={{ color: '#0D6EFD' }}>
                                {venue.seatMap.sections?.length || 0}
                              </div>
                              <div className="text-sm" style={{ color: '#ABA8A9' }}>Sections</div>
                            </div>
                            <div className="text-center p-4 rounded-xl border"
                              style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                              <div className="text-2xl font-bold" style={{ color: '#39FD48' }}>
                                {venue.seatMap.wheelchair_accessible?.length || 0}
                              </div>
                              <div className="text-sm" style={{ color: '#ABA8A9' }}>♿ Accessible</div>
                            </div>
                          </div>

                          {/* Special Features */}
                          {venue.seatMap.special_features && venue.seatMap.special_features.length > 0 && (
                            <div className="p-4 rounded-xl border" style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                              <h4 className="text-lg font-bold mb-3" style={{ color: '#fff' }}>Special Features</h4>
                              <div className="flex flex-wrap gap-2">
                                {venue.seatMap.special_features.map((feature: string, index: number) => (
                                  <span key={index} className="px-3 py-1 rounded-full text-sm border"
                                    style={{ backgroundColor: '#39FD48' + '20', borderColor: '#39FD48', color: '#39FD48' }}>
                                    {feature.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Fallback for old seating data or no seatMap */}
                      {!venue?.seatMap && seatingLayout.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold text-center" style={{ color: '#fff' }}>Legacy Seating Layout</h4>
                          <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
                            {seatingLayout.slice(0, 100).map((seat, index) => (
                              <div
                                key={seat.id || index}
                                className="w-8 h-8 rounded border flex items-center justify-center text-xs font-medium cursor-pointer"
                                style={{
                                  backgroundColor: '#39FD48',
                                  borderColor: '#39FD48',
                                  color: '#000'
                                }}
                                title={`Seat ${seat.number || index + 1} - Section: ${seat.section || 'N/A'} - Row: ${seat.row || 'N/A'}`}
                              >
                                {seat.number || index + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No seating data available */}
                      {!venue?.seatMap && seatingLayout.length === 0 && (
                        <div className="text-center py-12">
                          <Grid3X3 className="h-16 w-16 mx-auto mb-4" style={{ color: '#ABA8A9' }} />
                          <h4 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>No Seating Data</h4>
                          <p style={{ color: '#ABA8A9' }}>No seating layout found for this venue</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'events' && (
                  <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                    style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold" style={{ color: '#fff' }}>Upcoming Events</h3>
                      {eventsLoading && (
                        <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading events...
                        </div>
                      )}
                    </div>
                    
                    {!eventsLoading && upcomingEvents.length > 0 ? (
                      <div className="space-y-6">
                        {upcomingEvents.map(event => (
                          <div key={event.id} className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300" 
                            style={{ borderColor: '#0D6EFD' + '30', backgroundColor: '#0D6EFD' + '10' }}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h4 className="text-xl font-bold mr-3" style={{ color: '#fff' }}>{event.title}</h4>
                                  <span className="px-2 py-1 text-xs rounded-full border"
                                    style={{ 
                                      backgroundColor: event.status === 'APPROVED' ? '#39FD48' + '20' : '#0D6EFD' + '20',
                                      borderColor: event.status === 'APPROVED' ? '#39FD48' : '#0D6EFD',
                                      color: event.status === 'APPROVED' ? '#39FD48' : '#0D6EFD'
                                    }}>
                                    {event.status}
                                  </span>
                                </div>
                                
                                <p className="mb-4" style={{ color: '#ABA8A9' }}>{event.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                                    <Calendar className="h-4 w-4 mr-2" style={{ color: '#39FD48' }} />
                                    <div>
                                      <div className="font-medium">Start: {new Date(event.startDate).toLocaleDateString()} {event.startTime && `at ${event.startTime}`}</div>
                                      {event.endDate && (
                                        <div>End: {new Date(event.endDate).toLocaleDateString()} {event.endTime && `at ${event.endTime}`}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                                    <div className="mr-4">
                                      <span className="px-2 py-1 rounded text-xs border"
                                        style={{ backgroundColor: '#0D6EFD' + '20', borderColor: '#0D6EFD', color: '#0D6EFD' }}>
                                        {event.category}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="px-2 py-1 rounded text-xs border"
                                        style={{ backgroundColor: '#39FD48' + '20', borderColor: '#39FD48', color: '#39FD48' }}>
                                        {event.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {event.Tenant && (
                                  <div className="flex items-center text-sm mb-4" style={{ color: '#ABA8A9' }}>
                                    <Users className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
                                    Organized by: <span className="font-medium ml-1" style={{ color: '#fff' }}>{event.Tenant.name}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                {event.image && (
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border"
                                    style={{ borderColor: '#39FD48' + '30' }}>
                                    <img 
                                      src={event.image} 
                                      alt={event.title} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                
                                <Link href={`/events/${event.id}`}>
                                  <Button className="text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Event
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !eventsLoading ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-6" style={{ color: '#ABA8A9' }} />
                        <h4 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>No Events Scheduled</h4>
                        <p style={{ color: '#ABA8A9' }}>Check back soon for upcoming events at this venue</p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-[#0D6EFD] border-t-[#39FD48] rounded-full mx-auto animate-spin mb-6"></div>
                        <h4 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Loading Events...</h4>
                        <p style={{ color: '#ABA8A9' }}>Fetching events for this venue</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="space-y-8">
                    {/* Venue Amenities */}
                    <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                      style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                      <h3 className="text-2xl font-bold mb-6" style={{ color: '#fff' }}>Venue Amenities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(venue.amenities && venue.amenities.length > 0 ? venue.amenities : [
                          'Professional Sound System',
                          'Stage Lighting',
                          'Climate Control',
                          'WiFi Access',
                          'Security System',
                          'Parking Available',
                          'Accessible Facilities',
                          'Catering Kitchen'
                        ]).map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center p-4 rounded-xl border transition-all duration-300 hover:shadow-md"
                            style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                            <div className="w-3 h-3 rounded-full mr-4" style={{ backgroundColor: '#39FD48' }}></div>
                            <span className="font-medium" style={{ color: '#fff' }}>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accessibility Features */}
                    <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                      style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                      <h3 className="text-2xl font-bold mb-6" style={{ color: '#fff' }}>Accessibility Features</h3>
                      <div className="space-y-4">
                        {[
                          'Wheelchair accessible entrances',
                          'Accessible restrooms',
                          'Reserved accessible seating',
                          'Hearing loop system',
                          'Sign language interpretation available',
                          'Large print programs'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center p-4 rounded-xl border transition-all duration-300 hover:shadow-md"
                            style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                            <Shield className="h-5 w-5 mr-4" style={{ color: '#39FD48' }} />
                            <span className="font-medium" style={{ color: '#fff' }}>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-8">
                    {/* Contact Information */}
                    <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                      style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                      <h3 className="text-2xl font-bold mb-6" style={{ color: '#fff' }}>Contact Information</h3>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                            <Phone className="h-6 w-6" style={{ color: '#0D6EFD' }} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Phone</h4>
                            <p style={{ color: '#ABA8A9' }}>{venue.contact?.phone || '+1 (555) 123-4567'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: '#39FD48' + '20' }}>
                            <Mail className="h-6 w-6" style={{ color: '#39FD48' }} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Email</h4>
                            <p style={{ color: '#ABA8A9' }}>{venue.contact?.email || 'info@venue.com'}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                            <MapPin className="h-6 w-6" style={{ color: '#0D6EFD' }} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Address</h4>
                            <p style={{ color: '#ABA8A9' }}>
                              {venue.location || 'Location not specified'}
                            </p>
                          </div>
                        </div>

                        {venue.tenant && (
                          <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-full" style={{ backgroundColor: '#39FD48' + '20' }}>
                              <Users className="h-6 w-6" style={{ color: '#39FD48' }} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Managed by</h4>
                              <p style={{ color: '#ABA8A9' }}>{venue.tenant.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Form */}
                    <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" 
                      style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                      <h3 className="text-2xl font-bold mb-6" style={{ color: '#fff' }}>Send a Message</h3>
                      <form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#39FD48] transition-all duration-300"
                            style={{ 
                              backgroundColor: '#0D6EFD' + '20', 
                              borderColor: '#0D6EFD' + '30',
                              color: '#fff'
                            }}
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Email</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#39FD48] transition-all duration-300"
                            style={{ 
                              backgroundColor: '#0D6EFD' + '20', 
                              borderColor: '#0D6EFD' + '30',
                              color: '#fff'
                            }}
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#fff' }}>Message</label>
                          <textarea
                            rows={5}
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#39FD48] transition-all duration-300"
                            style={{ 
                              backgroundColor: '#0D6EFD' + '20', 
                              borderColor: '#0D6EFD' + '30',
                              color: '#fff'
                            }}
                            placeholder="Your message..."
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
                          style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}
                        >
                          Send Message
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl sticky top-8" 
                  style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#fff' }}>Quick Actions</h3>
                  <div className="space-y-4">
                    <Button className="w-full text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
                      style={{ background: '#0D6EFD' }}>
                      <Phone className="mr-2 h-5 w-5" />
                      Call Venue
                    </Button>
                    <Button 
                      
                      className="w-full py-3 rounded-xl  text-white   transition-all duration-300" style={{ background: '#0D6EFD' }}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Send Email
                    </Button>
                    <Button 
                      
                      className="w-full py-3 rounded-xl  text-white  hover:text-black transition-all duration-300" style={{ background: '#0D6EFD' }}
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      Get Directions
                    </Button>
                  </div>

                  {/* Venue Stats */}
                  <div className="mt-8 pt-6 border-t" style={{ borderColor: '#39FD48' + '30' }}>
                    <h4 className="text-lg font-bold mb-4" style={{ color: '#fff' }}>Venue Stats</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl border"
                        style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2" style={{ color: '#0D6EFD' }} />
                          <span className="font-medium" style={{ color: '#fff' }}>Capacity</span>
                        </div>
                        <span className="font-bold" style={{ color: '#39FD48' }}>
                          {venue.capacity ? Number(venue.capacity).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-xl border"
                        style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '30' }}>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2" style={{ color: '#39FD48' }} />
                          <span className="font-medium" style={{ color: '#fff' }}>Events</span>
                        </div>
                        <span className="font-bold" style={{ color: '#0D6EFD' }}>
                          {upcomingEvents.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl border"
                        style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 mr-2 fill-current" style={{ color: '#39FD48' }} />
                          <span className="font-medium" style={{ color: '#fff' }}>Rating</span>
                        </div>
                        <span className="font-bold" style={{ color: '#39FD48' }}>4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
