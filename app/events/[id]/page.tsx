"use client"

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft,
  Ticket
} from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';
import { fetchEventById, fetchVenueById } from '@/lib/api';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<any>(null);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventById(resolvedParams.id)
      .then(data => {
        const eventData = data.data;
        setEvent(eventData);
        
        // If event has venueId, fetch venue details
        if (eventData?.venueId) {
          return fetchVenueById(eventData.venueId);
        }
        return null;
      })
      .then(venueData => {
        if (venueData) {
          setVenue(venueData.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching event", err);
        // Fallback to mock data if API fails
        const mockEvent = mockEvents.find(e => e.id === resolvedParams.id);
        setEvent(mockEvent);
        if (mockEvent?.venueId) {
          const mockVenue = mockVenues.find(v => v.id === mockEvent.venueId);
          setVenue(mockVenue);
        }
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ticketTypes = [
    {
      id: 'general',
      name: 'General Admission',
      price: event.price,
      description: 'Standard entry to the event',
      available: event.availableTickets
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      price: event.price * 2,
      description: 'Premium access with exclusive perks',
      available: Math.floor(event.availableTickets * 0.1)
    },
    {
      id: 'student',
      name: 'Student Discount',
      price: Math.floor(event.price * 0.8),
      description: 'Special pricing for students with valid ID',
      available: Math.floor(event.availableTickets * 0.3)
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-8 flex items-center justify-center">
              <Calendar className="h-20 w-20 text-primary" />
            </div>

            {/* Event Info */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {event.category && (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {event.category}
                    </span>
                  )}
                  {event.tags && (
                    <div className="flex items-center space-x-2">
                      {event.tags.map((tag: string) => (
                        <span key={tag} className="text-xs text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              
              <div className="flex items-center text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{event.organizer}</span>
                </div>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="bg-card rounded-lg border p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-muted-foreground">{event.venue}</p>
                    {venue && (
                      <p className="text-sm text-muted-foreground">
                        {venue.address}, {venue.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-muted-foreground">
                      {event.availableTickets} of {event.capacity} available
                    </p>
                  </div>
                </div>
              </div>

              {venue && (
                <div className="mt-6 pt-6 border-t">
                  <Link href={`/venues/${venue.id}`}>
                    <Button variant="outline" size="sm">
                      View Venue Details
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Venue Info */}
            {venue && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-4">About the Venue</h3>
                <p className="text-muted-foreground mb-4">{venue.description}</p>
                {venue.amenities && (
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity: string) => (
                      <span key={amenity} className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-6">Book Your Tickets</h3>
              
              {/* Simple Ticket Info */}
              <div className="p-4 border rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">General Admission</h4>
                  <span className="font-bold text-primary">${event.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Standard entry to the event
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.availableTickets} available
                </p>
              </div>

              {/* Booking Actions */}
              <div className="space-y-4">
                <Link href={`/events/${event.id}/seating`}>
                  <Button className="w-full" size="lg">
                    <Ticket className="mr-2 h-5 w-5" />
                    Select Seats
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full">
                  Add to Watchlist
                </Button>
              </div>

              {/* Price Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Service fee</span>
                  <span>$5.00</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>${event.price + 5}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
