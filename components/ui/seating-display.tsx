'use client';

import React, { useState, useEffect } from 'react';
import { getSeatingArrangementsByVenue, getSeatsByArrangement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Crown,
  Armchair,
  Grid,
  Info
} from 'lucide-react';

interface SeatingArrangement {
  id: number;
  venue_id: number;
  tenant_id: number;
  floor_label: string;
  rows: number;
  cols: number;
  total_vip: number;
  total_regular: number;
  created_at: string;
}

interface Seat {
  id: number;
  arrangement_id: number;
  seat_code: string;
  row_no: number;
  col_no: number;
  status: 'active' | 'inactive';
  seat_type: 'vip' | 'regular' | 'none';
  price: number | null;
}

interface SeatingDisplayProps {
  venueId: number;
  eventId?: number;
  showPrices?: boolean;
  onSeatSelect?: (seatId: number, seatInfo: Seat) => void;
  selectedSeats?: number[];
}

export function SeatingDisplay({ 
  venueId, 
  eventId, 
  showPrices = true, 
  onSeatSelect,
  selectedSeats = []
}: SeatingDisplayProps) {
  const [arrangements, setArrangements] = useState<SeatingArrangement[]>([]);
  const [selectedArrangement, setSelectedArrangement] = useState<SeatingArrangement | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seating arrangements for venue
  useEffect(() => {
    async function fetchArrangements() {
      try {
        setLoading(true);
        setError(null);
        const response = await getSeatingArrangementsByVenue(venueId);
        setArrangements(response.data || []);
        
        // Auto-select first arrangement if available
        if (response.data && response.data.length > 0) {
          setSelectedArrangement(response.data[0]);
        }
      } catch (err: any) {
        setError(`Failed to load seating arrangements: ${err.message}`);
        console.error('Error fetching seating arrangements:', err);
      } finally {
        setLoading(false);
      }
    }

    if (venueId) {
      fetchArrangements();
    }
  }, [venueId]);

  // Fetch seats for selected arrangement
  useEffect(() => {
    async function fetchSeats() {
      if (!selectedArrangement) return;
      
      try {
        setError(null);
        const response = await getSeatsByArrangement(selectedArrangement.id);
        setSeats(response.data || []);
      } catch (err: any) {
        setError(`Failed to load seats: ${err.message}`);
        console.error('Error fetching seats:', err);
      }
    }

    fetchSeats();
  }, [selectedArrangement]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'inactive' || !onSeatSelect) return;
    onSeatSelect(seat.id, seat);
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'inactive') return '#gray-400';
    if (selectedSeats.includes(seat.id)) return '#green-500';
    if (seat.seat_type === 'vip') return '#yellow-500';
    if (seat.seat_type === 'regular') return '#blue-500';
    return '#gray-300';
  };

  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    const isClickable = seat.status === 'active' && onSeatSelect;
    
    return {
      backgroundColor: getSeatColor(seat),
      cursor: isClickable ? 'pointer' : 'default',
      opacity: seat.status === 'inactive' ? 0.4 : 1,
      border: isSelected ? '2px solid #000' : '1px solid #ccc',
      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.2s ease'
    };
  };

  const renderSeatGrid = () => {
    if (!selectedArrangement || seats.length === 0) return null;

    const { rows, cols } = selectedArrangement;
    const seatGrid: (Seat | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Fill grid with seats
    seats.forEach(seat => {
      const row = seat.row_no - 1; // Convert to 0-based
      const col = seat.col_no - 1; // Convert to 0-based
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        seatGrid[row][col] = seat;
      }
    });

    return (
      <div className="flex flex-col items-center space-y-2">
        {/* Stage indicator */}
        <div className="w-full max-w-md h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold mb-4">
          🎭 STAGE
        </div>
        
        {/* Seat grid */}
        <div 
          className="grid gap-1 p-4 bg-gray-50 rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            maxWidth: `${Math.min(cols * 30 + 32, 800)}px`
          }}
        >
          {seatGrid.map((row, rowIndex) =>
            row.map((seat, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold"
                style={seat ? getSeatStyle(seat) : { backgroundColor: '#transparent' }}
                onClick={() => seat && handleSeatClick(seat)}
                title={seat ? `${seat.seat_code} - ${seat.seat_type} - $${seat.price || 0}` : ''}
              >
                {seat?.status === 'active' ? '💺' : seat ? '❌' : ''}
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
            <span>Regular ({selectedArrangement.total_regular})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-yellow-500"></div>
            <span>VIP ({selectedArrangement.total_vip})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-gray-400"></div>
            <span>Unavailable</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-green-500"></div>
              <span>Selected ({selectedSeats.length})</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Grid className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading seating arrangements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <Info className="h-5 w-5" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (arrangements.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Armchair className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Seating Arrangements</h3>
        <p className="text-gray-600">This venue doesn't have any seating arrangements configured yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Arrangement selector */}
      {arrangements.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Floor/Section:</label>
          <div className="flex flex-wrap gap-2">
            {arrangements.map((arrangement) => (
              <Button
                key={arrangement.id}
                variant={selectedArrangement?.id === arrangement.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedArrangement(arrangement)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {arrangement.floor_label}
                <span className="text-xs opacity-75">
                  ({arrangement.total_regular + arrangement.total_vip} seats)
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Selected arrangement info */}
      {selectedArrangement && (
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedArrangement.floor_label}
            </h3>
            <span className="text-sm text-muted-foreground">
              {selectedArrangement.rows} × {selectedArrangement.cols} grid
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{selectedArrangement.total_regular} Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span>{selectedArrangement.total_vip} VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Created {new Date(selectedArrangement.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Seat grid */}
      {renderSeatGrid()}

      {/* Price information */}
      {showPrices && seats.length > 0 && (
        <div className="bg-background border rounded-lg p-4">
          <h4 className="font-medium mb-3">Pricing Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(seats.filter(s => s.status === 'active').map(s => s.seat_type))).map(type => {
              const seatsOfType = seats.filter(s => s.seat_type === type && s.status === 'active');
              const prices = Array.from(new Set(seatsOfType.map(s => s.price).filter(p => p !== null)));
              
              return (
                <div key={type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {type === 'vip' ? (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Users className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="font-medium capitalize">{type} Seats</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {prices.length === 1 ? 
                        `$${prices[0]}` : 
                        `$${Math.min(...prices)} - $${Math.max(...prices)}`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {seatsOfType.length} available
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
