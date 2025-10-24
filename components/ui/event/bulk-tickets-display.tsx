'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, RefreshCw, MapPin } from 'lucide-react';
import { BulkTicket, getEventBulkTickets } from '@/lib/api_ticket';
import { Button } from '@/components/ui/button';
import { getVenueSeats, type SeatSection } from '@/lib/api';

interface BulkTicketsDisplayProps {
  eventId: number;
  venueId?: number; // Add venueId to fetch sections
  onRefresh?: () => void;
}

const cardBg = "#23262F";
const greenBorder = "#CBF83E" + '50';

export default function BulkTicketsDisplay({ eventId, venueId, onRefresh }: BulkTicketsDisplayProps) {
  const [bulkTickets, setBulkTickets] = useState<BulkTicket[]>([]);
  const [sections, setSections] = useState<SeatSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Get section name by ID
  const getSectionName = (sectionId?: string): string => {
    if (!sectionId) return 'Not assigned';
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown section';
  };

  // Get section details by ID
  const getSectionDetails = (sectionId?: string): SeatSection | null => {
    if (!sectionId) return null;
    return sections.find(s => s.id === sectionId) || null;
  };

  const loadBulkTickets = async () => {
    try {
      setError('');
      const tickets = await getEventBulkTickets(eventId);
      setBulkTickets(tickets);
    } catch (err: any) {
      console.error('Error loading bulk tickets:', err);
      
      // Check if it's a 404 error (no tickets created yet)
      if (err.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
        // This is expected for new events - don't show as error
        setBulkTickets([]);
      } else {
        // Actual error - show error message
        setError(err.message || 'Failed to load bulk tickets');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load venue sections if venueId is provided
  useEffect(() => {
    const fetchSections = async () => {
      if (!venueId) return;
      try {
        const venueData = await getVenueSeats(venueId);
        if (venueData.seatMap?.sections) {
          setSections(venueData.seatMap.sections);
        }
      } catch (err) {
        console.error('Error fetching venue sections:', err);
      }
    };

    fetchSections();
  }, [venueId]);

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
        style={{ backgroundColor: cardBg, borderColor: greenBorder }}
      >
        <div className="text-center py-4" style={{ color: '#ABA8A9' }}>
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
      style={{ backgroundColor: cardBg, borderColor: greenBorder }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center" style={{ color: '#fff' }}>
          <Ticket className="w-5 h-5 mr-2" />
          Bulk Tickets
        </h3>
        <Button
          onClick={handleRefresh}
          size="sm"
          disabled={refreshing}
          style={{ background: '#CBF83E', color: '#000' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#ff6b3520', borderLeft: '4px solid #ff6b35' }}>
          <p className="text-sm" style={{ color: '#ff6b35' }}>{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {bulkTickets.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-3">
              <Ticket className="w-12 h-12 mx-auto" style={{ color: '#ABA8A9', opacity: 0.5 }} />
            </div>
            <p className="text-base font-medium mb-1" style={{ color: '#fff' }}>
              No Tickets Created Yet
            </p>
            <p className="text-sm" style={{ color: '#ABA8A9' }}>
              Click "Create Tickets" above to add bulk tickets for this event
            </p>
          </div>
        ) : (
          bulkTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="p-4 rounded-lg border" 
              style={{ 
                backgroundColor: '#1f222a',
                borderColor: ticket.seat_type === 'VIP' ? '#FFD700' : greenBorder
              }}
            >
              {/* Seat Type Badge and Section Info */}
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: ticket.seat_type === 'VIP' ? '#FFD70030' : '#CBF83E30',
                    color: ticket.seat_type === 'VIP' ? '#FFD700' : '#CBF83E'
                  }}
                >
                  {ticket.seat_type}
                </span>
                <span className="text-xs" style={{ color: '#ABA8A9' }}>
                  Prefix: <span style={{ color: '#fff' }}>{ticket.seat_prefix}</span>
                </span>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#ABA8A9' }}>Price</p>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                    Rs.{ticket.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#ABA8A9' }}>Total Seats</p>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>
                    {ticket.total_seats}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#ABA8A9' }}>Available</p>
                  <p className="text-sm font-semibold" style={{ 
                    color: ticket.available_seats > 0 ? '#4ade80' : '#ff6b35' 
                  }}>
                    {ticket.available_seats}
                  </p>
                </div>
              </div>

              {/* Availability Bar */}
              <div className="mt-3">
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#0f1114' }}>
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(ticket.available_seats / ticket.total_seats) * 100}%`,
                      backgroundColor: ticket.available_seats > ticket.total_seats * 0.5 ? '#4ade80' : 
                                      ticket.available_seats > 0 ? '#fbbf24' : '#ff6b35'
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: '#ABA8A9' }}>
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
