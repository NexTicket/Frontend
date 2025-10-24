'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Ticket, MapPin, Users } from 'lucide-react';
import { getVenueSeats, type SeatSection } from '@/lib/api';

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
  const [sections, setSections] = useState<SeatSection[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch venue sections on mount
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoadingSections(true);
      try {
        const venueData = await getVenueSeats(venueId);
        if (venueData.seatMap?.sections) {
          setSections(venueData.seatMap.sections);
        }
      } catch (err) {
        console.error('Error fetching venue sections:', err);
        setError('Failed to load venue sections');
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSections();
  }, [venueId]);

  // Handle section selection - auto-fill seat prefix and total seats
  const handleSectionChange = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      // Set the section NAME as the seat prefix (this will be saved to database)
      setSeatPrefix(section.name);
      
      // Auto-fill total seats with section capacity
      const sectionCapacity = section.rows * section.columns;
      setTotalSeats(sectionCapacity.toString());
      
      console.log('[CreateTicketForm] Section selected:', section.name, 'ID:', section.id, 'Capacity:', sectionCapacity);
    } else {
      // Clear if no section selected
      setSeatPrefix('');
      setTotalSeats('');
    }
  };

  // Get selected section details by seat prefix (now matches by name)
  const getSelectedSectionDetails = () => {
    if (!seatPrefix) return null;
    return sections.find(s => s.name === seatPrefix);
  };

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

    // Validate against section capacity if section is selected
    const section = getSelectedSectionDetails();
    if (section) {
      const sectionCapacity = section.rows * section.columns;
      if (totalSeatsNum > sectionCapacity) {
        setError(`Total seats cannot exceed section capacity (${sectionCapacity})`);
        return;
      }
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

        {/* Seat Section Selection (integrates seat prefix and auto-fills total seats) */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
            <MapPin className="w-4 h-4 inline mr-1" />
            Venue Section *
          </label>
          {isLoadingSections ? (
            <div className="text-center py-4" style={{ color: '#ABA8A9' }}>
              Loading sections...
            </div>
          ) : sections.length > 0 ? (
            <>
              <select
                value={seatPrefix}
                onChange={(e) => handleSectionChange(e.target.value)}
                
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: '#1f222a',
                  borderColor: greenBorder,
                  color: '#fff'
                }}
              >
                <option value="">Select a section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name} ({section.rows}×{section.columns} = {section.rows * section.columns} seats)
                  </option>
                ))}
              </select>
              
              {/* Section Details */}
              {seatPrefix && getSelectedSectionDetails() && (
                <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: '#1f222a', borderLeft: '4px solid #CBF83E' }}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span style={{ color: '#ABA8A9' }}>Seat Prefix:</span>
                      <span className="ml-2 font-mono font-medium" style={{ color: '#CBF83E' }}>
                        {getSelectedSectionDetails()!.name}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#ABA8A9' }}>Capacity:</span>
                      <span className="ml-2 font-medium" style={{ color: '#fff' }}>
                        <Users className="w-4 h-4 inline mr-1" />
                        {getSelectedSectionDetails()!.rows * getSelectedSectionDetails()!.columns} seats
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: '#ABA8A9' }}>
                    💡 Total seats will be automatically set to section capacity
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-sm" style={{ color: '#ABA8A9' }}>
              No sections available for this venue
            </div>
          )}
        </div>

        {/* Total Seats (Auto-filled from section) */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
            Total Seats {seatPrefix ? '(auto-filled from section)' : '(max: ' + venueCapacity + ')'}
          </label>
          <input
            type="number"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            min="1"
            max={venueCapacity}
            required
            readOnly={!!seatPrefix}
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: seatPrefix ? '#1a1d24' : '#1f222a',
              borderColor: greenBorder,
              color: '#fff',
              cursor: seatPrefix ? 'not-allowed' : 'text'
            }}
            placeholder="Select a section to auto-fill"
          />
          {seatPrefix && (
            <p className="mt-1 text-xs" style={{ color: '#ABA8A9' }}>
              ℹ️ Total seats is locked to match the selected section's capacity
            </p>
          )}
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
