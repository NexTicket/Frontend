'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Ticket } from 'lucide-react';

interface CreateTicketFormProps {
  eventId: number;
  venueId: number;
  venueCapacity: number;
  onSuccess: () => void;
  onClose: () => void;
}

const darkBg = "#181A20";
const cardBg = "#23262F";
const greenBorder = "#CBF83E" + '50';

export default function CreateTicketForm({
  eventId,
  venueId,
  venueCapacity,
  onSuccess,
  onClose
}: CreateTicketFormProps) {
  const [seatType, setSeatType] = useState<'VIP' | 'REGULAR'>('REGULAR');
  const [price, setPrice] = useState<string>('');
  const [totalSeats, setTotalSeats] = useState<string>('');
  const [seatPrefix, setSeatPrefix] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const priceNum = parseFloat(price);
    const totalSeatsNum = parseInt(totalSeats);

    if (priceNum < 100) {
      setError('Price must be at least 100');
      return;
    }

    if (totalSeatsNum <= 0) {
      setError('Total seats must be greater than 0');
      return;
    }

    if (totalSeatsNum > venueCapacity) {
      setError(`Total seats cannot exceed venue capacity (${venueCapacity})`);
      return;
    }

    if (!seatPrefix.trim()) {
      setError('Seat prefix is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { createBulkTicket } = await import('@/lib/api_ticket');
      
      await createBulkTicket({
        event_id: eventId,
        venue_id: venueId,
        seat_type: seatType,
        price: priceNum,
        total_seats: totalSeatsNum,
        available_seats: totalSeatsNum,
        seat_prefix: seatPrefix.trim()
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating bulk ticket:', err);
      setError(err.message || 'Failed to create tickets. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl"
      style={{ backgroundColor: cardBg, borderColor: greenBorder }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium flex items-center" style={{ color: '#fff' }}>
          <Ticket className="w-5 h-5 mr-2" />
          Create Bulk Tickets
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seat Type */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
            Seat Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSeatType('REGULAR')}
              className="px-4 py-3 rounded-lg border-2 transition-all font-medium"
              style={{
                backgroundColor: seatType === 'REGULAR' ? '#CBF83E' : '#1f222a',
                borderColor: seatType === 'REGULAR' ? '#CBF83E' : greenBorder,
                color: seatType === 'REGULAR' ? '#000' : '#fff'
              }}
            >
              REGULAR
            </button>
            <button
              type="button"
              onClick={() => setSeatType('VIP')}
              className="px-4 py-3 rounded-lg border-2 transition-all font-medium"
              style={{
                backgroundColor: seatType === 'VIP' ? '#CBF83E' : '#1f222a',
                borderColor: seatType === 'VIP' ? '#CBF83E' : greenBorder,
                color: seatType === 'VIP' ? '#000' : '#fff'
              }}
            >
              VIP
            </button>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
            Price (minimum LKR100)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="100"
            step="0.01"
            required
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: '#1f222a',
              borderColor: greenBorder,
              color: '#fff'
            }}
            placeholder="Enter ticket price"
          />
        </div>

        {/* Total Seats */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
            Total Seats (max: {venueCapacity})
          </label>
          <input
            type="number"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            min="1"
            max={venueCapacity}
            required
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: '#1f222a',
              borderColor: greenBorder,
              color: '#fff'
            }}
            placeholder="Enter number of seats"
          />
        </div>

        {/* Seat Prefix */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
            Seat Prefix
          </label>
          <input
            type="text"
            value={seatPrefix}
            onChange={(e) => setSeatPrefix(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: '#1f222a',
              borderColor: greenBorder,
              color: '#fff'
            }}
            placeholder="e.g., A, B, VIP"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ff6b3520', borderLeft: '4px solid #ff6b35' }}>
            <p className="text-sm" style={{ color: '#ff6b35' }}>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 font-medium"
          style={{ background: '#CBF83E', color: '#000' }}
        >
          {isSubmitting ? 'Creating Tickets...' : 'Create Tickets'}
        </Button>
      </form>
    </motion.div>
  );
}
