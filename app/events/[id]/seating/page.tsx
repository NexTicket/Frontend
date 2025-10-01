"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SimpleBookingSummary } from '@/components/ui/simple-booking-test';
import { 
  ArrowLeft,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { VenueSeatMap, getVenueSeatMap, getEventSeatAvailability, addToCartUnified, reserveSeats, releaseSeats } from '@/lib/unified-api';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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

// Convert SeatMapSeat to the format expected by the UI
interface DisplaySeat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
  seatType?: 'VIP' | 'REGULAR';
}

interface SeatingPageProps {
  params: {
    id: string;
  };
}

export default function SeatingPage({ params }: SeatingPageProps) {
  const routerParams = useParams();
  const id = routerParams?.id as string;
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState<DisplaySeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatMap, setSeatMap] = useState<VenueSeatMap | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch event data from database
  const fetchEventData = useCallback(async () => {
    try {
      console.log('📡 Fetching event data for ID:', id);
      const response = await fetch(`http://localhost:4000/api/events/geteventbyid/${id}`);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Event data loaded:', responseData);
        
        // Extract the actual event data from the response wrapper
        const eventData = responseData.data || responseData;
        
        if (eventData && eventData.id) {
          setEvent(eventData);
          console.log('✅ Event set with venueId:', eventData.venueId);
          return eventData;
        } else {
          console.error('❌ No event data found in response');
          return null;
        }
      } else {
        console.error('❌ Failed to fetch event:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching event:', error);
      return null;
    }
  }, [id]);

  // Load venue seat map and availability data
  const loadSeatData = useCallback(async (eventData: any) => {
    if (!eventData || !eventData.venueId) {
      console.warn('⚠️ No event data or venueId available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎪 Loading seat map for venue:', eventData.venueId);
      
      // Get the venue seat map first
      const venueMap = await getVenueSeatMap(Number(eventData.venueId));
      console.log('✅ Venue seat map loaded:', venueMap);
      setSeatMap(venueMap);
      
      // Get event-specific seat availability
      let displaySeats: DisplaySeat[] = [];
      
      try {
        const availabilityData = await getEventSeatAvailability(Number(id));
        console.log('✅ Seat availability loaded:', availabilityData);
        
        // Convert seat map to display format and merge with availability
        if (venueMap && venueMap.sections) {
          venueMap.sections.forEach(section => {
            console.log('🎭 Processing section:', section.name, 'rows:', section.rows, 'columns:', section.columns);
            
            // Generate seats from section metadata (rows is a number, not array)
            for (let rowNum = 1; rowNum <= section.rows; rowNum++) {
              for (let seatNum = 1; seatNum <= section.columns; seatNum++) {
                const seatId = `${section.id}-${rowNum}-${seatNum}`;
                
                // Check if this specific seat is sold or reserved for this event
                const isSold = availabilityData?.soldSeats?.includes(seatId) || false;
                const reservationInfo = availabilityData?.reservedSeats?.find(r => r.seatId === seatId);
                const isReservedByOther = reservationInfo && reservationInfo.reservedBy !== user?.uid;
                
                // Calculate price based on section multiplier (assuming base price from event)
                const basePrice = eventData?.price || 50; // Fallback price
                const seatPrice = basePrice * (section.price_multiplier || 1);
                
                displaySeats.push({
                  id: seatId,
                  row: `${String.fromCharCode(64 + rowNum)}`, // A, B, C, etc.
                  number: seatNum,
                  section: section.name || section.id,
                  price: seatPrice,
                  seatType: section.price_multiplier > 1.2 ? 'VIP' : 'REGULAR',
                  isAvailable: !isSold && !isReservedByOther,
                  isSelected: false
                });
              }
            }
          });
        }
      } catch (availabilityError) {
        console.warn('⚠️ Could not fetch seat availability, using venue map only:', availabilityError);
        
        // Fallback to just venue seat map without availability data
        if (venueMap && venueMap.sections) {
          venueMap.sections.forEach(section => {
            console.log('🎭 Fallback processing section:', section.name, 'rows:', section.rows, 'columns:', section.columns);
            
            // Generate seats from section metadata
            for (let rowNum = 1; rowNum <= section.rows; rowNum++) {
              for (let seatNum = 1; seatNum <= section.columns; seatNum++) {
                const seatId = `${section.id}-${rowNum}-${seatNum}`;
                
                // Calculate price based on section multiplier
                const basePrice = eventData?.price || 50;
                const seatPrice = basePrice * (section.price_multiplier || 1);
                
                displaySeats.push({
                  id: seatId,
                  row: `${String.fromCharCode(64 + rowNum)}`, // A, B, C, etc.
                  number: seatNum,
                  section: section.name || section.id,
                  price: seatPrice,
                  seatType: section.price_multiplier > 1.2 ? 'VIP' : 'REGULAR',
                  isAvailable: true, // Default to available
                  isSelected: false
                });
              }
            }
          });
        }
      }
      
      console.log('🪑 Display seats processed:', displaySeats.length, 'seats');
      setSeats(displaySeats);
      
    } catch (err) {
      console.error('❌ Error loading seat data:', err);
      setError('Failed to load seat information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  // Main effect to load event data and then seat data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First fetch event data
        const eventData = await fetchEventData();
        
        if (eventData) {
          // Then load seat data with the fetched event data
          await loadSeatData(eventData);
        } else {
          setError('Event not found');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Failed to load event information');
        setLoading(false);
      }
    };

    loadAllData();
  }, [fetchEventData, loadSeatData]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#39FD48' }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>Loading Event</h1>
            <p style={{ color: '#ABA8A9' }}>Fetching seat map and availability...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#EF4444' + '50', boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.1)' }}>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#EF4444' }}>Error Loading Event</h1>
            <p className="mb-4" style={{ color: '#ABA8A9' }}>{error}</p>
            <Link href="/events">
              <Button 
                className="text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #0D6EFD, #CBF83E)' }}
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Event Not Found</h1>
            <Link href="/events">
              <Button 
                className="text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #0D6EFD, #CBF83E)' }}
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSeatClick = async (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat?.isAvailable) return;

    if (!user) {
      setError('Please sign in to select seats');
      return;
    }

    const isCurrentlySelected = seat.isSelected;
    
    // Update UI immediately for responsiveness
    setSeats(seats.map(s => 
      s.id === seatId 
        ? { ...s, isSelected: !s.isSelected }
        : s
    ));

    if (isCurrentlySelected) {
      // Deselecting seat - release reservation
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      // TODO: Release seat reservation when deselected
    } else {
      // Selecting seat - create reservation
      try {
        setSelectedSeats([...selectedSeats, seatId]);
        
        // Reserve the seat temporarily (5 minutes)
        const reservationResult = await reserveSeats(
          parseInt(id),
          [seatId],
          user.uid,
          300 // 5 minutes
        );
        
        if (!reservationResult?.success) {
          // Reservation failed - revert selection
          setSeats(seats.map(s => 
            s.id === seatId 
              ? { ...s, isSelected: false }
              : s
          ));
          setSelectedSeats(selectedSeats.filter(id => id !== seatId));
          setError('Failed to reserve seat. It may have been taken by another user.');
          return;
        }
        
        console.log('✅ Seat reserved successfully:', reservationResult);
      } catch (error) {
        console.error('❌ Error reserving seat:', error);
        // Revert UI changes on error
        setSeats(seats.map(s => 
          s.id === seatId 
            ? { ...s, isSelected: false }
            : s
        ));
        setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        setError('Failed to reserve seat. Please try again.');
      }
    }
  };

  const handleClearAllSeats = () => {
    setSeats(seats.map(s => ({ ...s, isSelected: false })));
    setSelectedSeats([]);
  };

  // Add selected seats to cart and create order
  const handleAddToCart = async () => {
    if (!user) {
      setError('Please sign in to book seats');
      router.push('/auth/signin');
      return;
    }

    if (selectedSeatsData.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (!event) {
      setError('Event information not available');
      return;
    }

    try {
      setAddingToCart(true);
      setError(null);

      console.log('🛒 Adding seats to cart:', selectedSeatsData);

      // For now, we need to create a bulk ticket or use existing ones
      // Let's create individual cart items for each seat
      const cartData = {
        firebaseUid: user.uid,
        eventId: parseInt(id),
        venueId: event.venue?.id || event.venueId || 1, // Include venue ID
        seatIds: selectedSeatsData.map(seat => seat.id),
        seats: selectedSeatsData.map(seat => ({
          seatId: seat.id,
          seatType: seat.seatType,
          price: seat.price,
          section: seat.section,
          row: seat.row,
          number: seat.number
        })),
        totalAmount: totalPrice,
        eventTitle: event.title,
        eventDate: event.startDate,
        venueName: event.venue?.name || 'Unknown Venue'
      };

      console.log('📦 Adding cart data:', cartData);
      
      // Use the new seat reservations cart endpoint
      const ticketServiceUrl = process.env.NEXT_PUBLIC_TICKET_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${ticketServiceUrl}/api/seat-reservations/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(cartData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add seats to cart');
      }

      const result = await response.json();
      console.log('✅ Seats added to cart:', result);

      // Mark seats as pending/reserved
      setSeats(seats.map(seat => {
        if (seat.isSelected) {
          return { ...seat, isReserved: true, isAvailable: false, isSelected: false };
        }
        return seat;
      }));

      // Clear selected seats
      setSelectedSeats([]);

      // Show success message and navigate to cart
      alert(`Successfully added ${selectedSeatsData.length} seat(s) to cart!`);
      router.push('/tickets/cart');
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to add seats to cart: ${errorMessage}`);
    } finally {
      setAddingToCart(false);
    }
  };

  const selectedSeatsData = seats.filter(s => s.isSelected);
  const totalPrice = selectedSeatsData.reduce((sum, seat) => sum + seat.price, 0);

  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = {};
    }
    if (!acc[seat.section][seat.row]) {
      acc[seat.section][seat.row] = [];
    }
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {} as Record<string, Record<string, DisplaySeat[]>>);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#39FD48' }} />
          <p style={{ color: '#ABA8A9' }}>Loading seat map...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#DC2626' + '50' }}>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#fff' }}>Error Loading Seats</h1>
            <p className="mb-4" style={{ color: '#ABA8A9' }}>{error}</p>
            <Button 
              onClick={loadSeatData}
              className="text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0D6EFD, #CBF83E)' }}
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#191C24' }}>
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#ABA8A9' }}></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/events/${id}`} 
                className="inline-flex items-center transition-colors duration-200 hover:opacity-80"
                style={{ color: '#ABA8A9' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#ABA8A9'; }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>{event.title}</h1>
                {event.venue && (
                  <p className="text-sm mb-1" style={{ color: '#CBF83E' }}>
                    📍 {event.venue.name} • {event.venue.location}
                  </p>
                )}
                <p style={{ color: '#ABA8A9' }}>Select your seats</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Seating Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                {/* Stage */}
                <div className="rounded-lg p-4 mb-8 text-center" style={{ background: 'linear-gradient(135deg, #0D6EFD' + '20, #CBF83E' + '20)' }}>
                  <h3 className="text-lg font-semibold" style={{ color: '#CBF83E' }}>STAGE</h3>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center flex-wrap gap-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#39FD48' }}></div>
                    <span className="text-sm" style={{ color: '#ABA8A9' }}>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: '#CBF83E', borderColor: '#FFD700' }}></div>
                    <span className="text-sm" style={{ color: '#ABA8A9' }}>VIP Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0D6EFD' }}></div>
                    <span className="text-sm" style={{ color: '#ABA8A9' }}>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm" style={{ color: '#ABA8A9' }}>Occupied</span>
                  </div>
                </div>

                {/* Debug Information */}
                {process.env.NODE_ENV === 'development' && seatMap && (
                  <div className="mb-4 p-3 border rounded" style={{ borderColor: '#39FD48' + '30', backgroundColor: '#39FD48' + '10' }}>
                    <p className="text-xs" style={{ color: '#ABA8A9' }}>
                      Debug: Venue {seatMap.venueId} • {seatMap.sections.length} sections • {seats.length} seats generated
                    </p>
                  </div>
                )}
                
                {/* Seating Sections */}
                {seats.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="mb-4" style={{ color: '#ABA8A9' }}>No seats available for this event</p>
                    <Button 
                      onClick={async () => {
                        if (event) {
                          await loadSeatData(event);
                        }
                      }}
                      className="text-white hover:opacity-90 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #0D6EFD, #CBF83E)' }}
                    >
                      Retry Loading Seats
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedSeats).map(([section, rows]) => (
                    <div key={section} className="border rounded-lg p-4" style={{ borderColor: '#39FD48' + '30' }}>
                      <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: '#fff' }}>{section}</h3>
                      <div className="space-y-2">
                        {Object.entries(rows).map(([row, rowSeats]) => (
                          <div key={row} className="flex items-center justify-center space-x-1">
                            <span className="text-sm w-8 text-center" style={{ color: '#ABA8A9' }}>{row}</span>
                            {rowSeats.map(seat => {
                              const isVIP = seat.seatType === 'VIP';
                              const getSeatColor = () => {
                                if (seat.isSelected) return '#0D6EFD';
                                if (!seat.isAvailable) return '#DC2626';
                                return isVIP ? '#CBF83E' : '#39FD48';
                              };
                              
                              return (
                                <button
                                  key={seat.id}
                                  onClick={() => handleSeatClick(seat.id)}
                                  className={`w-8 h-8 rounded text-xs font-bold transition-all duration-200 hover:scale-105 relative ${
                                    seat.isSelected
                                      ? 'text-white'
                                      : seat.isAvailable
                                      ? 'text-black hover:opacity-80'
                                      : 'text-white cursor-not-allowed opacity-60'
                                  } ${isVIP && seat.isAvailable ? 'border-2' : ''}`}
                                  style={{
                                    backgroundColor: getSeatColor(),
                                    borderColor: isVIP && seat.isAvailable ? '#FFD700' : 'transparent'
                                  }}
                                  disabled={!seat.isAvailable}
                                  title={`${seat.section} ${seat.row}${seat.number}${isVIP ? ' (VIP)' : ''} - $${seat.price}`}
                                >
                                  {seat.number}
                                  {isVIP && seat.isAvailable && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Booking Summary */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <SimpleBookingSummary
                selectedSeatsData={selectedSeatsData}
                totalPrice={totalPrice}
                onRemoveSeat={(seatId: string) => handleSeatClick(seatId)}
                onClearAllSeats={() => handleClearAllSeats()}
                serviceFee={5.00}
                checkoutUrl="/tickets/cart"
              />
              
              {/* Add to Cart Button */}
              {selectedSeatsData.length > 0 && (
                <div className="mt-4">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={addingToCart || !user}
                    className="w-full text-white hover:opacity-90 transition-opacity flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #CBF83E)' }}
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add {selectedSeatsData.length} Seat{selectedSeatsData.length > 1 ? 's' : ''} to Cart
                      </>
                    )}
                  </Button>
                  
                  {!user && (
                    <p className="text-xs mt-2 text-center" style={{ color: '#ABA8A9' }}>
                      Please <Link href="/auth/signin" className="underline text-blue-400">sign in</Link> to book seats
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
