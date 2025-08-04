"use client"

import React, { useState, use } from 'react';
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

interface SeatingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SeatingPage({ params }: SeatingPageProps) {
  const resolvedParams = use(params);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState(mockSeats);
  
  const event = mockEvents.find(e => e.id === resolvedParams.id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/events/${resolvedParams.id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground">Select your seats</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-lg font-bold text-primary">${totalPrice}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seating Chart */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border p-6">
              {/* Stage */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 mb-8 text-center">
                <h3 className="text-lg font-semibold text-primary">STAGE</h3>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span className="text-sm text-muted-foreground">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-muted-foreground">Occupied</span>
                </div>
              </div>

              {/* Seating Sections */}
              <div className="space-y-8">
                {Object.entries(groupedSeats).map(([section, rows]) => (
                  <div key={section} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">{section}</h3>
                    <div className="space-y-2">
                      {Object.entries(rows).map(([row, rowSeats]) => (
                        <div key={row} className="flex items-center justify-center space-x-1">
                          <span className="text-sm text-muted-foreground w-8 text-center">{row}</span>
                          {rowSeats.map(seat => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat.id)}
                              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                                seat.isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : seat.isAvailable
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-red-500 text-white cursor-not-allowed'
                              }`}
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
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              {selectedSeatsData.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeatsData.map(seat => (
                      <div key={seat.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {seat.section} {seat.row}{seat.number}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSeatClick(seat.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-medium">${seat.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Subtotal</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Service fee</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>${totalPrice + 5}</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No seats selected</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click on available seats to select them
                  </p>
                </div>
              )}

              {/* Seat Selection Tips */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Best seats are usually in the center</li>
                  <li>• Front rows may have limited view</li>
                  <li>• Aisle seats offer easy access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
