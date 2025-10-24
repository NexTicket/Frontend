'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, RefreshCw } from 'lucide-react';
import { BulkTicket, getEventBulkTickets } from '@/lib/api_ticket';
import { Button } from '@/components/ui/button';

interface BulkTicketsDisplayProps {
  eventId: number;
  onRefresh?: () => void;
}

const cardBg = "#F8F9FA"; // Light gray for cards
const blueBorder = "#1877F2" + '40'; // Blue border with transparency

export default function BulkTicketsDisplay({ eventId, onRefresh }: BulkTicketsDisplayProps) {
  const [bulkTickets, setBulkTickets] = useState<BulkTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadBulkTickets = async () => {
    try {
      setError('');
      const tickets = await getEventBulkTickets(eventId);
      setBulkTickets(tickets);
    } catch (err: any) {
      console.error('Error loading bulk tickets:', err);
      setError(err.message || 'Failed to load bulk tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBulkTickets();
  }, [eventId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBulkTickets();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
        style={{ backgroundColor: cardBg, borderColor: blueBorder }}
      >
        <div className="text-center py-4" style={{ color: '#6B7280' }}>
          Loading bulk tickets...
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
      style={{ backgroundColor: cardBg, borderColor: blueBorder }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center" style={{ color: '#000' }}>
          <Ticket className="w-5 h-5 mr-2" style={{ color: '#1877F2' }} />
          Bulk Tickets
        </h3>
        <Button
          onClick={handleRefresh}
          size="sm"
          disabled={refreshing}
          style={{ background: '#1877F2', color: '#fff' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444' }}>
          <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {bulkTickets.length === 0 ? (
          <p className="text-center py-4" style={{ color: '#6B7280' }}>
            No bulk tickets created yet
          </p>
        ) : (
          bulkTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="p-4 rounded-lg border" 
              style={{ 
                backgroundColor: '#fff',
                borderColor: ticket.seat_type === 'VIP' ? '#F59E0B' : blueBorder
              }}
            >
              {/* Seat Type Badge */}
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: ticket.seat_type === 'VIP' ? '#FEF3C7' : '#DBEAFE',
                    color: ticket.seat_type === 'VIP' ? '#D97706' : '#1877F2'
                  }}
                >
                  {ticket.seat_type}
                </span>
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  Prefix: <span style={{ color: '#000' }}>{ticket.seat_prefix}</span>
                </span>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Price</p>
                  <p className="text-sm font-semibold" style={{ color: '#000' }}>
                    ${ticket.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Total Seats</p>
                  <p className="text-sm font-semibold" style={{ color: '#000' }}>
                    {ticket.total_seats}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Available</p>
                  <p className="text-sm font-semibold" style={{ 
                    color: ticket.available_seats > 0 ? '#10B981' : '#EF4444' 
                  }}>
                    {ticket.available_seats}
                  </p>
                </div>
              </div>

              {/* Availability Bar */}
              <div className="mt-3">
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(ticket.available_seats / ticket.total_seats) * 100}%`,
                      backgroundColor: ticket.available_seats > ticket.total_seats * 0.5 ? '#10B981' : 
                                      ticket.available_seats > 0 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: '#6B7280' }}>
                  {((ticket.available_seats / ticket.total_seats) * 100).toFixed(0)}% available
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
