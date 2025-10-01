"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  X,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  className = ""
}: BookingSummaryProps) {
  const router = useRouter();
  return (
    <motion.div 
      variants={itemVariants} 
      className={`lg:col-span-1 ${className}`}
    >
      <div 
        className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl sticky top-8" 
        style={{ 
          backgroundColor: '#191C24', 
          borderColor: '#0D6EFD' + '30', 
          boxShadow: '0 25px 50px -12px rgba(74, 144, 226, 0.1)' 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>
            Booking Summary
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-sm" style={{ color: '#ABA8A9' }}>
              {selectedSeatsData.length} seat{selectedSeatsData.length !== 1 ? 's' : ''} selected
            </p>
            {selectedSeatsData.length > 0 && onClearAllSeats && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllSeats}
                className="h-6 px-2 text-xs hover:bg-red-500/20 transition-colors duration-200"
                style={{ color: '#DC2626' }}
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
                    <span className="text-sm font-medium" style={{ color: '#ABA8A9' }}>
                      {seat.section} {seat.row}{seat.number}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSeat(seat.id)}
                      className="h-6 w-6 p-0 hover:bg-red-500/20 transition-colors duration-200"
                    >
                      <X className="h-3 w-3" style={{ color: '#DC2626' }} />
                    </Button>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#CBF83E' }}>
                    LKR {seat.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4" style={{ borderColor: '#0D6EFD' + '30' }}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: '#ABA8A9' }}>Subtotal</span>
                <span style={{ color: '#fff' }}>LKR {totalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: '#ABA8A9' }}>Service fee</span>
                <span style={{ color: '#ABA8A9' }}>LKR {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span style={{ color: '#fff' }}>Total</span>
                <span style={{ color: '#CBF83E' }}>LKR {(totalPrice + serviceFee).toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              onClick={() => router.push(checkoutUrl)}
              className="w-full text-white hover:opacity-90 transition-opacity" 
              size="lg"
              style={{ background: '#0D6EFD' }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Proceed to Checkout
            </Button>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" 
              style={{ background: 'linear-gradient(135deg, #39FD48' + '20, #CBF83E' + '20)' }}
            >
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
  );
}
