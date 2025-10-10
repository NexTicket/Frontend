"use client"

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Tag,
  Edit,
  Eye,
  Settings
} from 'lucide-react';
import { fetchEventById, fetchVenueSeatMap } from '@/lib/api';
import { Loading } from '@/components/ui/loading';

interface EventViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventViewPage({ params }: EventViewPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [event, setEvent] = useState<any>(null);
  const [seatMap, setSeatMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching event with ID:', unwrappedParams.id);
        
        // Fetch event details
        const eventResponse = await fetchEventById(unwrappedParams.id);
        const eventData = eventResponse?.data || eventResponse;
        console.log('✅ Event data fetched:', eventData);
        setEvent(eventData);

        // Fetch venue seat map if venue exists
        // if (eventData?.venueId) {
        //   try {
        //     const seatMapResponse = await fetchVenueSeatMap(eventData.venueId);
        //     const seatMapData = seatMapResponse?.data || seatMapResponse;
        //     console.log('✅ Seat map fetched:', seatMapData);
        //     setSeatMap(seatMapData);
        //   } catch (seatMapError) {
        //     // console.warn('⚠️ Could not load seat map:', seatMapError);
        //     // Continue without seat map
        //   }
        // }
      } catch (err: any) {
        console.error('❌ Failed to load event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="lg" text="Loading event details..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <Link href="/organizer/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats from real data (simplified for now - can be enhanced later)
  const totalSeats = seatMap?.capacity || 0;
  const availableSeats = 0; // Will need ticket service integration for actual sold seats
  const soldSeats = 0; // Will need ticket service integration
  const revenue = 0; // Will need order/payment service integration

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/organizer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/organizer/events/${unwrappedParams.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-6">
              {/* Event Image */}
              {event.image ? (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-6 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-6 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary" />
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              <p className="text-muted-foreground mb-6">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Start Time</p>
                    <p className="text-sm text-muted-foreground">{event.startTime || 'TBD'}</p>
                  </div>
                </div>
                {event.endDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {event.endTime && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">End Time</p>
                      <p className="text-sm text-muted-foreground">{event.endTime}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{event.venue?.name || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{event.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className={`text-sm font-medium ${
                      event.status === 'APPROVED' ? 'text-green-600' :
                      event.status === 'PENDING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {event.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Event Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">Total Seats</span>
                  </div>
                  <span className="font-medium">{totalSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Available</span>
                  </div>
                  <span className="font-medium">{availableSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Sold</span>
                  </div>
                  <span className="font-medium">{soldSeats}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">Revenue</span>
                  </div>
                  <span className="font-medium">${revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href={`/organizer/events/${unwrappedParams.id}/edit`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event Details
                  </Button>
                </Link>
                <Link href={`/organizer/events/${unwrappedParams.id}/seating-edit`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Seating Layout
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Sales Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Venue & Seating Information */}
        {seatMap ? (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Venue & Seating Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Venue Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {seatMap.name || event.venue?.name || 'N/A'}</p>
                  <p><span className="text-muted-foreground">Location:</span> {seatMap.location || event.venue?.location || 'N/A'}</p>
                  <p><span className="text-muted-foreground">Total Capacity:</span> {seatMap.capacity || 'N/A'}</p>
                  {seatMap.description && (
                    <p><span className="text-muted-foreground">Description:</span> {seatMap.description}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Seat Map Info</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    The venue has a configured seating layout. Customers can select their seats during ticket booking.
                  </p>
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="h-3 w-3 mr-2" />
                      View Public Event Page
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Seat Map Preview */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Seating Layout Preview</h3>
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Interactive seat selection is available on the public booking page
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Link href={`/events/${event.id}`}>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Event Page
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Seating Information</h2>
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No seating layout configured for this event's venue yet.
              </p>
              {event.venue?.id && (
                <Link href={`/organizer/venues/${event.venue.id}/edit`}>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Venue Seating
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
