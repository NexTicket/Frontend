"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Users, 
  Check,
  X,
  ShoppingCart
} from 'lucide-react';
import { mockEvents, mockSeats } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { use } from 'react';

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

interface SeatingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SeatingPage({ params }: SeatingPageProps) {
  const { id } = use(params);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState(mockSeats);
  
  const event = mockEvents.find(e => e.id === id);

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
  }, {} as Record<string, Record<string, typeof seats>>);

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
                <p style={{ color: '#ABA8A9' }}>Select your seats</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: '#ABA8A9' }}>
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-lg font-bold" style={{ color: '#CBF83E' }}>${totalPrice}</p>
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
                <div className="flex items-center justify-center space-x-8 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#39FD48' }}></div>
                    <span className="text-sm" style={{ color: '#ABA8A9' }}>Available</span>
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

                {/* Seating Sections */}
                <div className="space-y-8">
                  {Object.entries(groupedSeats).map(([section, rows]) => (
                    <div key={section} className="border rounded-lg p-4" style={{ borderColor: '#39FD48' + '30' }}>
                      <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: '#fff' }}>{section}</h3>
                      <div className="space-y-2">
                        {Object.entries(rows).map(([row, rowSeats]) => (
                          <div key={row} className="flex items-center justify-center space-x-1">
                            <span className="text-sm w-8 text-center" style={{ color: '#ABA8A9' }}>{row}</span>
                            {rowSeats.map(seat => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat.id)}
                                className={`w-8 h-8 rounded text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                  seat.isSelected
                                    ? 'text-white'
                                    : seat.isAvailable
                                    ? 'text-white hover:opacity-80'
                                    : 'text-white cursor-not-allowed opacity-60'
                                }`}
                                style={{
                                  backgroundColor: seat.isSelected
                                    ? '#0D6EFD'
                                    : seat.isAvailable
                                    ? '#39FD48'
                                    : '#DC2626'
                                }}
                                disabled={!seat.isAvailable}
                              >
                                {seat.number}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Booking Summary */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl sticky top-8" style={{ backgroundColor: '#191C24', borderColor: '#0D6EFD' + '30', boxShadow: '0 25px 50px -12px rgba(74, 144, 226, 0.1)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>Booking Summary</h3>
                
                {selectedSeatsData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {selectedSeatsData.map(seat => (
                        <div key={seat.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium" style={{ color: '#ABA8A9' }}>
                              {seat.section} {seat.row}{seat.number}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSeatClick(seat.id)}
                              className="h-6 w-6 p-0 hover:bg-red-500/20 transition-colors duration-200"
                            >
                              <X className="h-3 w-3" style={{ color: '#DC2626' }} />
                            </Button>
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#CBF83E' }}>${seat.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4" style={{ borderColor: '#0D6EFD' + '30' }}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span style={{ color: '#ABA8A9' }}>Subtotal</span>
                        <span style={{ color: '#fff' }}>${totalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span style={{ color: '#ABA8A9' }}>Service fee</span>
                        <span style={{ color: '#ABA8A9' }}>$5.00</span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span style={{ color: '#fff' }}>Total</span>
                        <span style={{ color: '#CBF83E' }}>${totalPrice + 5}</span>
                      </div>
                    </div>

                    <Link href="/checkout">
                      <Button 
                        className="w-full text-white hover:opacity-90 transition-opacity" 
                        size="lg"
                        style={{ background: 'linear-gradient(135deg, #0D6EFD, #CBF83E)' }}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #39FD48' + '20, #CBF83E' + '20)' }}>
                      <Users className="h-6 w-6" style={{ color: '#39FD48' }} />
                    </div>
                    <p style={{ color: '#ABA8A9' }}>No seats selected</p>
                    <p className="text-sm mt-2" style={{ color: '#ABA8A9' }}>
                      Click on available seats to select them
                    </p>
                  </div>
                )}

                {/* Seat Selection Tips */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: '#0D6EFD' + '30' }}>
                  <h4 className="font-medium mb-2" style={{ color: '#fff' }}>Tips</h4>
                  <ul className="text-sm space-y-1" style={{ color: '#ABA8A9' }}>
                    <li>• Best seats are usually in the center</li>
                    <li>• Front rows may have limited view</li>
                    <li>• Aisle seats offer easy access</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
