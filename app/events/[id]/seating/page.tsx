"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookingSummary } from '@/components/ui/booking-summary';
import { 
  ArrowLeft,
  Info,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { use } from 'react';
import { getVenueSeats, VenueSeatMap, SeatSection, fetchEventById } from '@/lib/api';
import { getBulkTicketPrices, BulkTicketPrice, getEventSeatStatus, EventSeatStatusResponse } from '@/lib/api_ticket';

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

interface Seat {
  id: string;
  section: string;
  sectionName: string;
  row: number;
  col: number;
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
  isLocked: boolean; // New: indicates if seat is temporarily locked
  isBooked: boolean; // New: indicates if seat is already sold
  color: string;
  bulkTicketId?: number; // Add bulk ticket ID to seat
}

interface SeatingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SeatingPage({ params }: SeatingPageProps) {
  const { id } = use(params);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatMap, setSeatMap] = useState<VenueSeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [bulkTicketPrices, setBulkTicketPrices] = useState<BulkTicketPrice[]>([]);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  useEffect(() => {
    const loadEventAndSeatMap = async () => {
      try {
        setLoading(true);
        console.log('Loading event with ID:', id);
        
        // Fetch event details first
        const eventResponse = await fetchEventById(id);
        console.log('Event data received:', eventResponse);
        
        if (!eventResponse || !eventResponse.data) {
          setError('Event not found');
          setLoading(false);
          return;
        }
        
        const eventData = eventResponse.data;
        setEvent(eventData);
        
        if (!eventData.venueId) {
          setError('Event venue information not found');
          setLoading(false);
          return;
        }

        console.log('Loading seat map for venue ID:', eventData.venueId);
        const venueData = await getVenueSeats(eventData.venueId);
        setSeatMap(venueData.seatMap);

        // Fetch bulk ticket prices
        let pricesData: BulkTicketPrice[] = [];
        try {
          console.log('Fetching bulk ticket prices for venue:', eventData.venueId, 'event:', eventData.id);
          pricesData = await getBulkTicketPrices(eventData.venueId, eventData.id);
          console.log('Bulk ticket prices received:', pricesData);
          setBulkTicketPrices(pricesData);
        } catch (priceError) {
          console.warn('Failed to fetch bulk ticket prices, using default price of 1000:', priceError);
          // Continue with default prices
        }

        // Create a map of section to price and bulk_ticket_id
        const priceMap = new Map<string, { price: number; bulkTicketId: number }>();
        pricesData.forEach((priceInfo) => {
          priceMap.set(priceInfo.section.toLowerCase(), {
            price: priceInfo.price,
            bulkTicketId: priceInfo.bulk_ticket_id
          });
        });

        // Fetch seat status (booked and locked seats)
        let seatStatus: EventSeatStatusResponse | null = null;
        try {
          console.log('[SeatingPage] Fetching seat status for event:', eventData.id);
          seatStatus = await getEventSeatStatus(eventData.id);
          console.log('[SeatingPage] Seat status received:', seatStatus);
          console.log('[SeatingPage] Booked seats:', seatStatus.booked_seats);
          console.log('[SeatingPage] Locked seats:', seatStatus.locked_seats);
        } catch (statusError) {
          console.warn('[SeatingPage] Failed to fetch seat status:', statusError);
          // Continue without seat status - all seats will show as available
        }

        // Create lookup sets for faster checking
        const bookedSeatsSet = new Set<string>();
        const lockedSeatsSet = new Set<string>();

        if (seatStatus) {
          console.log('[SeatingPage] Processing booked seats...');
          seatStatus.booked_seats.forEach(seat => {
            // Use lowercase for case-insensitive matching
            const key = `${seat.section.toLowerCase()}-${seat.row_id}-${seat.col_id}`;
            console.log('[SeatingPage] Adding booked seat to set:', key, 'from', seat);
            bookedSeatsSet.add(key);
          });
          console.log('[SeatingPage] Booked seats set size:', bookedSeatsSet.size);
          console.log('[SeatingPage] Booked seats set contents:', Array.from(bookedSeatsSet));
          
          console.log('[SeatingPage] Processing locked seats...');
          seatStatus.locked_seats.forEach(seat => {
            // Use lowercase for case-insensitive matching
            const key = `${seat.section.toLowerCase()}-${seat.row_id}-${seat.col_id}`;
            console.log('[SeatingPage] Adding locked seat to set:', key, 'from', seat);
            lockedSeatsSet.add(key);
          });
          console.log('[SeatingPage] Locked seats set size:', lockedSeatsSet.size);
        }

        // Generate seats from seat map
        const generatedSeats: Seat[] = [];
        let bookedCount = 0;
        let lockedCount = 0;
        
        venueData.seatMap.sections.forEach((section: SeatSection) => {
          console.log('[SeatingPage] Processing section:', section.id, section.name);
          
          // Get price for this section from bulk ticket prices
          const sectionPriceInfo = priceMap.get(section.name.toLowerCase()) || 
                                   priceMap.get(section.id.toLowerCase());
          const seatPrice = sectionPriceInfo?.price || 1000; // Default to 1000 if no bulk price found
          const bulkTicketId = sectionPriceInfo?.bulkTicketId;

          for (let row = 0; row < section.rows; row++) {
            for (let col = 0; col < section.columns; col++) {
              const actualRow = section.startRow + row;
              const actualCol = section.startCol + col;
              
              // Use lowercase section ID for case-insensitive matching
              const seatKey = `${section.id.toLowerCase()}-${actualRow}-${actualCol}`;
              const isBooked = bookedSeatsSet.has(seatKey);
              const isLocked = lockedSeatsSet.has(seatKey);
              
              if (isBooked) {
                bookedCount++;
                console.log('[SeatingPage] Seat marked as BOOKED:', seatKey);
              }
              if (isLocked) {
                lockedCount++;
                console.log('[SeatingPage] Seat marked as LOCKED:', seatKey);
              }
              
              generatedSeats.push({
                id: seatKey,
                section: section.id,
                sectionName: section.name,
                row: actualRow,
                col: actualCol,
                price: seatPrice,
                isAvailable: !isBooked && !isLocked, // Seat is available if not booked or locked
                isBooked: isBooked,
                isLocked: isLocked,
                isSelected: false,
                color: section.color,
                bulkTicketId: bulkTicketId
              });
            }
          }
        });

        console.log('[SeatingPage] ====== SEAT GENERATION SUMMARY ======');
        console.log('[SeatingPage] Total seats generated:', generatedSeats.length);
        console.log('[SeatingPage] Booked seats found:', bookedCount);
        console.log('[SeatingPage] Locked seats found:', lockedCount);
        console.log('[SeatingPage] Available seats:', generatedSeats.length - bookedCount - lockedCount);
        console.log('[SeatingPage] Sample generated seats:', generatedSeats.slice(0, 5).map(s => ({
          id: s.id,
          isBooked: s.isBooked,
          isLocked: s.isLocked,
          isAvailable: s.isAvailable
        })));
        console.log('[SeatingPage] ====================================');

        setSeats(generatedSeats);
        setLoading(false);
      } catch (err: any) {
        console.error('[SeatingPage] Error loading event or seat map:', err);
        setError(err.message || 'Failed to load event or seat map');
        setLoading(false);
      }
    };

    loadEventAndSeatMap();
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-accent"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card border-border">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Event Not Found</h1>
            <Link href="/events">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat?.isAvailable) return;

    setSeats(seats.map(s => 
      s.id === seatId 
        ? { ...s, isSelected: !s.isSelected }
        : s
    ));

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleClearAllSeats = () => {
    setSeats(seats.map(s => ({ ...s, isSelected: false })));
    setSelectedSeats([]);
  };

  const selectedSeatsData = seats.filter(s => s.isSelected);
  const totalPrice = selectedSeatsData.reduce((sum, seat) => sum + seat.price, 0);

  // Group seats by section
  const groupedBySection = seatMap?.sections.reduce((acc, section) => {
    const sectionSeats = seats.filter(s => s.section === section.id);
    if (sectionSeats.length > 0) {
      acc[section.id] = {
        section,
        seats: sectionSeats
      };
    }
    return acc;
  }, {} as Record<string, { section: SeatSection; seats: Seat[] }>) || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-accent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-muted"></div>
      
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
                <p style={{ color: '#ABA8A9' }}>Select your seats</p>
              </div>
            </div>
          </motion.div>

          {/* Info Banner */}
          <AnimatePresence>
            {showInfoBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/50 bg-blue-100 dark:bg-gradient-to-r dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/40 backdrop-blur-xl p-6 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10"></div>
                  
                  <button
                    onClick={() => setShowInfoBanner(false)}
                    className="absolute top-4 right-4 rounded-lg p-1 hover:bg-blue-500/20 transition-colors"
                  >
                    <X className="h-5 w-5 text-blue-950 dark:text-blue-950" />
                  </button>

                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 ring-2 ring-blue-500/50">
                          <Info className="h-6 w-6 text-blue-950 dark:text-blue-950" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-950 dark:text-blue-950mb-3">
                          How Booking Works
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/40 text-blue-950 dark:text-blue-950 font-semibold text-sm flex-shrink-0">
                              1
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-950 dark:text-blue-950 mb-1">Select Your Seats</p>
                              <p className="text-xs text-blue-900 dark:text-blue-950">Choose your preferred seats from the seating chart</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/40 text-blue-950 dark:text-blue-950 font-semibold text-sm flex-shrink-0">
                              2
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-950 dark:text-blue-950 mb-1">Proceed to Checkout</p>
                              <p className="text-xs text-blue-900 dark:text-blue-950/80">Click "Proceed to Checkout" to lock your seats</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/40 text-blue-950 dark:text-blue-950 font-semibold text-sm flex-shrink-0">
                              3
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-950 dark:text-blue-950 mb-1">Complete Payment</p>
                              <p className="text-xs text-blue-900 dark:text-blue-950/80">Finish payment within 5 minutes to secure your tickets</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-300 dark:bg-blue-900/10 border border-amber-600/50 dark:border-amber-500/30 px-4 py-3">
                          <Clock className="h-4 w-4 text-blue-800 dark:text-blue-900 flex-shrink-0" />
                          <p className="text-xs text-black dark:text-black">
                            <strong>Important:</strong> Your seats will be reserved for <strong>5 minutes</strong> after checkout. Complete payment within this time or seats will be released.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Seating Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading seat map...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Stage */}
                    <div className="rounded-lg p-4 mb-8 text-center bg-primary/20">
                      <h3 className="text-lg font-semibold text-primary">STAGE</h3>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 mb-8 flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-primary"></div>
                        <span className="text-sm text-muted-foreground">Selected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm text-muted-foreground">Locked</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm" style={{ color: '#ABA8A9' }}>Booked</span>
                      </div>
                    </div>

                    {/* Seating Sections */}
                    <div className="space-y-8">
                      {Object.entries(groupedBySection).map(([sectionId, { section, seats: sectionSeats }]) => {
                        // Group seats by row within section
                        const rowGroups: Record<number, Seat[]> = {};
                        sectionSeats.forEach(seat => {
                          if (!rowGroups[seat.row]) {
                            rowGroups[seat.row] = [];
                          }
                          rowGroups[seat.row].push(seat);
                        });

                        return (
                          <div key={sectionId} className="border rounded-lg p-4" style={{ borderColor: section.color + '50' }}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>
                                {section.name}
                              </h3>
                              <span className="text-sm px-3 py-1 rounded-full" style={{ 
                                backgroundColor: section.color + '20',
                                color: section.color
                              }}>
                                LKR {sectionSeats[0]?.price?.toFixed(0) || '1000'} per seat
                              </span>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(rowGroups)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([rowNum, rowSeats]) => {
                                  const sortedSeats = [...rowSeats].sort((a, b) => a.col - b.col);
                                  
                                  return (
                                    <div key={rowNum} className="flex items-center justify-center space-x-1">
                                      <span className="text-sm w-12 text-center" style={{ color: '#ABA8A9' }}>
                                        Row {Number(rowNum) + 1}
                                      </span>
                                      {sortedSeats.map(seat => {
                                        // Determine seat color based on state
                                        let seatColor = '#22C55E'; // Green for available
                                        let seatTitle = `${section.name} - Row ${seat.row + 1}, Seat ${seat.col + 1} - LKR ${seat.price}`;
                                        
                                        if (seat.isSelected) {
                                          seatColor = '#0D6EFD'; // Blue for selected
                                        } else if (seat.isBooked) {
                                          seatColor = '#DC2626'; // Red for booked
                                          seatTitle += ' (Booked)';
                                        } else if (seat.isLocked) {
                                          seatColor = '#EAB308'; // Yellow for locked
                                          seatTitle += ' (Locked by another user)';
                                        } else if (seat.isAvailable) {
                                          seatColor = section.color; // Section color for available
                                        }
                                        
                                        return (
                                          <button
                                            key={seat.id}
                                            onClick={() => handleSeatClick(seat.id)}
                                            className={`w-8 h-8 rounded text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                              seat.isSelected
                                                ? 'ring-2 ring-offset-2 ring-primary'
                                                : seat.isAvailable
                                                ? 'hover:opacity-80'
                                                : 'cursor-not-allowed opacity-60'
                                            }`}
                                            style={{
                                              backgroundColor: seatColor,
                                              color: '#fff'
                                            }}
                                            disabled={!seat.isAvailable}
                                            title={seatTitle}
                                          >
                                            {seat.col + 1}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Booking Summary */}
            <BookingSummary
              selectedSeatsData={selectedSeatsData.map(seat => ({
                id: seat.id,
                section: seat.sectionName,
                row: `${seat.row + 1}`,
                number: seat.col + 1,
                price: seat.price,
                isAvailable: seat.isAvailable,
                isSelected: seat.isSelected
              }))}
              totalPrice={totalPrice}
              onRemoveSeat={handleSeatClick}
              onClearAllSeats={handleClearAllSeats}
              serviceFee={0.00}
              checkoutUrl="/checkout"
              eventId={Number(event.id)}
              bulkTicketId={selectedSeatsData[0]?.bulkTicketId?.toString() || "1"}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
