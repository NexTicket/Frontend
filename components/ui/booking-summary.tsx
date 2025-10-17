"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Users, 
  X,
  ShoppingCart,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [errorToast, setErrorToast] = useState<{
    show: boolean;
    message: string;
    conflictedSeats?: string[];
  }>({
    show: false,
    message: '',
    conflictedSeats: []
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleProceedToCheckout = async () => {
    if (selectedSeatsData.length === 0) {
      console.error('No seats selected');
      return;
    }

    setIsLocking(true);
    setErrorToast({ show: false, message: '', conflictedSeats: [] });
    
    try {
      // Convert seat data to the new format with section, row_id, col_id
      const seatIds = selectedSeatsData.map(seat => {
        // Parse the section and position from the seat data
        // Expected format: seat has section (string), row (string/number), number (number)
        const sectionId = typeof seat.section === 'string' ? seat.section : seat.section;
        const rowId = typeof seat.row === 'string' ? parseInt(seat.row) - 1 : seat.row;
        const colId = seat.number - 1;
        
        return {
          section: sectionId,
          row_id: rowId,
          col_id: colId
        };
      });
      
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
          subtotal: totalPrice.toFixed(2),
          serviceFee: serviceFee.toFixed(2),
          expiresAt: response.expires_at,
          seatCount: selectedSeatsData.length
        }));
        
        // Proceed to checkout after successful seat locking
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Failed to lock seats:', error);
      
      // Check if it's a 409 Conflict error (seats already locked)
      if (error?.message?.includes('409') || error?.message?.toLowerCase().includes('conflict') || 
          error?.message?.toLowerCase().includes('already locked')) {
        
        // Try to extract conflicted seats from error message
        const conflictMatch = error.message.match(/Seats already locked by other users: \[(.*?)\]/i);
        const conflictedSeats = conflictMatch ? conflictMatch[1].split(',').map((s: string) => s.trim().replace(/['"]/g, '')) : [];
        
        setErrorToast({
          show: true,
          message: conflictedSeats.length > 0 
            ? `Some seats are no longer available` 
            : 'Some of your selected seats have been booked by another customer',
          conflictedSeats: conflictedSeats
        });
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
          setErrorToast({ show: false, message: '', conflictedSeats: [] });
        }, 8000);
      } else {
        // Generic error
        setErrorToast({
          show: true,
          message: 'Unable to lock seats. Please try again or contact support.',
          conflictedSeats: []
        });
        
        setTimeout(() => {
          setErrorToast({ show: false, message: '', conflictedSeats: [] });
        }, 6000);
      }
    } finally {
      setIsLocking(false);
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Error Toast Notification */}
      <AnimatePresence>
        {errorToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/95 to-red-900/95 backdrop-blur-xl shadow-2xl shadow-red-500/20">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 animate-pulse"></div>
              
              <div className="relative p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 ring-2 ring-red-500/50">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-red-100">
                        Seats No Longer Available
                      </h3>
                      <button
                        onClick={() => setErrorToast({ show: false, message: '', conflictedSeats: [] })}
                        className="flex-shrink-0 rounded-lg p-1 hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle className="h-5 w-5 text-red-300" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-red-200/90 mb-3">
                      {errorToast.message}
                    </p>
                    
                    {errorToast.conflictedSeats && errorToast.conflictedSeats.length > 0 && (
                      <div className="rounded-lg bg-red-950/50 border border-red-500/20 p-3 mb-3">
                        <p className="text-xs font-medium text-red-300 mb-2">Unavailable seats:</p>
                        <div className="flex flex-wrap gap-2">
                          {errorToast.conflictedSeats.map((seat, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-200 ring-1 ring-red-500/30"
                            >
                              <X className="h-3 w-3" />
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-red-300/80">
                      Please select different seats and try again.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: errorToast.conflictedSeats && errorToast.conflictedSeats.length > 0 ? 8 : 6, ease: 'linear' }}
                className="h-1 bg-gradient-to-r from-red-500 to-red-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
