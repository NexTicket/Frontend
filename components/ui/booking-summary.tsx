"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Users, 
  X,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { lockSeats } from '@/lib/api_ticket';
import { useState, useEffect } from 'react';

interface Seat {
  id: string;
  section: string;
  row: string;
  number: number;
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

interface BookingSummaryProps {
  selectedSeatsData: Seat[];
  totalPrice: number;
  onRemoveSeat: (seatId: string) => void;
  onClearAllSeats?: () => void;
  serviceFee?: number;
  checkoutUrl?: string;
  className?: string;
  eventId?: number;
  bulkTicketId?: string;
}

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

export function BookingSummary({
  selectedSeatsData,
  totalPrice,
  onRemoveSeat,
  onClearAllSeats,
  serviceFee = 5.00,
  checkoutUrl = "/checkout",
  className = "",
  eventId,
  bulkTicketId = "3"
}: BookingSummaryProps) {
  const [isLocking, setIsLocking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleProceedToCheckout = async () => {
    if (selectedSeatsData.length === 0) {
      console.error('No seats selected');
      return;
    }

    setIsLocking(true);
    try {
      const seatIds = selectedSeatsData.map(seat => `${seat.section}${seat.row}${seat.number}`);
      console.log('Locking seats:', seatIds);
      const response = await lockSeats({
        event_id: eventId || 1, // Use provided eventId or default to 1
        seat_ids: seatIds,
        bulk_ticket_id: bulkTicketId
      });

      // Store the order information in sessionStorage to use in checkout
      if (response.order_id && response.client_secret) {
        sessionStorage.setItem('checkoutData', JSON.stringify({
          orderId: response.order_id,
          clientSecret: response.client_secret,
          paymentIntentId: response.payment_intent_id,
          total: (totalPrice + serviceFee).toFixed(2),
          expiresAt: response.expires_at
        }));
        
        // Proceed to checkout after successful seat locking
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to lock seats:', error);
      alert('Failed to lock seats. Please try again.');
    } finally {
      setIsLocking(false);
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isMounted) {
    return null;
  }

  return (
    <motion.div 
      variants={itemVariants} 
      className={`lg:col-span-1 ${className}`}
    >
      <div 
        className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl sticky top-8 bg-card border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Booking Summary
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              {selectedSeatsData.length} seat{selectedSeatsData.length !== 1 ? 's' : ''} selected
            </p>
            {selectedSeatsData.length > 0 && onClearAllSeats && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllSeats}
                className="h-6 px-2 text-xs hover:bg-red-500/20 transition-colors duration-200 text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {selectedSeatsData.length > 0 ? (
          <div className="space-y-4">
            {/* Selected Seats List */}
            <div className="space-y-2">
              {selectedSeatsData.map(seat => (
                <div key={seat.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {seat.section} {seat.row}{seat.number}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSeat(seat.id)}
                      className="h-6 w-6 p-0 hover:bg-red-500/20 transition-colors duration-200"
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    LKR {seat.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 border-border">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">LKR {totalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Service fee</span>
                <span className="text-muted-foreground">LKR {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground">Total</span>
                <span className="text-primary font-semibold">LKR {(totalPrice + serviceFee).toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              onClick={handleProceedToCheckout}
              disabled={isLocking}
              className="w-full text-white hover:opacity-90 transition-opacity disabled:opacity-50" 
              size="lg"
              style={{ background: '#0D6EFD' }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isLocking ? 'Locking Seats...' : 'Proceed to Checkout'}
            </Button>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20"
            >
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground">No seats selected</p>
            <p className="text-sm mt-2 text-muted-foreground">
              Click on available seats to select them
            </p>
          </div>
        )}

        {/* Seat Selection Tips */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium mb-2 text-foreground">Tips</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Best seats are usually in the center</li>
            <li>• Front rows may have limited view</li>
            <li>• Aisle seats offer easy access</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
