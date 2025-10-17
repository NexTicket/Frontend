"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookingSummary } from '@/components/ui/booking-summary';
import { 
  ArrowLeft
} from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { use } from 'react';
import { getVenueSeats, VenueSeatMap, SeatSection } from '@/lib/api';

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
  color: string;
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
  
  const event = mockEvents.find(e => e.id === id);

  useEffect(() => {
    const loadSeatMap = async () => {
      if (!event?.venueId) {
        setError('Event venue information not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const venueData = await getVenueSeats(event.venueId);
        setSeatMap(venueData.seatMap);

        // Generate seats from seat map
        const generatedSeats: Seat[] = [];
        venueData.seatMap.sections.forEach((section: SeatSection) => {
          for (let row = 0; row < section.rows; row++) {
            for (let col = 0; col < section.columns; col++) {
              const actualRow = section.startRow + row;
              const actualCol = section.startCol + col;
              
              generatedSeats.push({
                id: `${section.id}-${actualRow}-${actualCol}`,
                section: section.id,
                sectionName: section.name,
                row: actualRow,
                col: actualCol,
                price: 100 * section.price_multiplier, // Base price multiplied by section multiplier
                isAvailable: true, // TODO: Check with locked seats from backend
                isSelected: false,
                color: section.color
              });
            }
          }
        });

        setSeats(generatedSeats);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading seat map:', err);
        setError(err.message || 'Failed to load seat map');
        setLoading(false);
      }
    };

    loadSeatMap();
  }, [event]);

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
                    <div className="flex items-center justify-center space-x-8 mb-8">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-primary"></div>
                        <span className="text-sm text-muted-foreground">Selected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm" style={{ color: '#ABA8A9' }}>Occupied</span>
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
                                LKR {(100 * section.price_multiplier).toFixed(0)} per seat
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
                                      {sortedSeats.map(seat => (
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
                                            backgroundColor: seat.isSelected
                                              ? '#0D6EFD'
                                              : seat.isAvailable
                                              ? section.color
                                              : '#DC2626',
                                            color: '#fff'
                                          }}
                                          disabled={!seat.isAvailable}
                                          title={`${section.name} - Row ${seat.row + 1}, Seat ${seat.col + 1} - LKR ${seat.price}`}
                                        >
                                          {seat.col + 1}
                                        </button>
                                      ))}
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
              bulkTicketId="3"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
