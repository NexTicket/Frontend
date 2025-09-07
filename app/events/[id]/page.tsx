"use client"

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share2, 
  Heart,
  Star,
  ArrowLeft,
  Ticket
} from 'lucide-react';
import { fetchEventById, fetchVenueById } from '@/lib/api';

// Event interface to match API
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  category: string;
  type: string;
  status: string;
  capacity: number;
  image?: string;
  venueId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  capacity: number;
  image?: string;
}

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState('general');
  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params using React.use()
  const { id } = use(params);
  
  // Load event and venue data
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        console.log('🎯 Loading event details for ID:', id);
        
        const eventResponse = await fetchEventById(id);
        console.log('🎯 Event loaded:', eventResponse);
        
        if (eventResponse && eventResponse.data) {
          setEvent(eventResponse.data);
          
          // Load venue data if venueId exists
          if (eventResponse.data.venueId) {
            try {
              const venueResponse = await fetchVenueById(eventResponse.data.venueId);
              console.log('🎯 Venue loaded:', venueResponse);
              if (venueResponse && venueResponse.data) {
                setVenue(venueResponse.data);
              }
            } catch (venueErr) {
              console.error('❌ Failed to load venue:', venueErr);
              // Don't set error for venue failure, just continue without venue data
            }
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('❌ Failed to load event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id]);

  // Helper functions
  const getEventImage = (event: Event) => {
    return event.image || '/Images/event-placeholder.jpg';
  };

  const formatEventDate = (startDate: string, startTime?: string) => {
    const date = new Date(startDate);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return startTime ? `${dateStr} at ${startTime}` : dateStr;
  };

  const formatEventTime = (startTime?: string, endTime?: string) => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    } else if (startTime) {
      return `Starting at ${startTime}`;
    } else {
      return 'Time TBA';
    }
  };

  const ticketTypes = [
    {
      id: 'general',
      name: 'General Admission',
      price: 3000,
      description: 'Standard entry to the event',
      available: event?.capacity ? Math.floor(event.capacity * 0.6) : 100
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      price: 6000,
      description: 'Premium access with exclusive perks',
      available: event?.capacity ? Math.floor(event.capacity * 0.1) : 10
    },
    {
      id: 'student',
      name: 'Student Discount',
      price: 2400,
      description: 'Special pricing for students with valid ID',
      available: event?.capacity ? Math.floor(event.capacity * 0.3) : 30
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Event...</h2>
          <p className="text-gray-400">Fetching event details for you</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#18181c] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-400 mb-4">
            {error || 'The event you are looking for does not exist or has been removed.'}
          </p>
          <Link href="/events">
            <Button className="bg-blue-600 hover:bg-blue-700">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType) || ticketTypes[0];

  return (
    <div className="min-h-screen bg-[#18181c] text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/events" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Event Image */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={getEventImage(event)}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`bg-black/50 backdrop-blur-sm hover:bg-black/70 ${
                    isLiked ? 'text-red-500' : 'text-white'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Event Info Card */}
          <div className="bg-[#23232b] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                {event.category}
              </span>
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                {event.type}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                event.status === 'APPROVED' ? 'bg-green-600 text-white' : 
                event.status === 'PENDING' ? 'bg-yellow-600 text-white' : 
                'bg-red-600 text-white'
              }`}>
                {event.status}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-4">{event.title}</h1>

            {/* Event Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="font-medium">{formatEventDate(event.startDate, event.startTime)}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <Clock className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="font-medium">{formatEventTime(event.startTime, event.endTime)}</p>
                </div>
              </div>

              {venue && (
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium">{venue.name}</p>
                    <p className="text-sm text-gray-400">{venue.address}, {venue.city}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center text-gray-300">
                <Users className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="font-medium">Capacity: {event.capacity?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Ticket Type</h3>
              <div className="space-y-2">
                {ticketTypes.map((ticket) => (
                  <label
                    key={ticket.id}
                    className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTicketType === ticket.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ticketType"
                      value={ticket.id}
                      checked={selectedTicketType === ticket.id}
                      onChange={(e) => setSelectedTicketType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        <p className="text-sm text-gray-400">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">LKR {ticket.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">{ticket.available} available</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href={`/events/${event.id}/seating`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium">
                  <Ticket className="mr-2 h-5 w-5" />
                  Book Tickets - LKR {selectedTicket.price.toLocaleString()}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Event
              </Button>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="bg-[#23232b] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">About This Event</h2>
          <p className="text-gray-300 leading-relaxed">{event.description}</p>
          
          {venue && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Venue Information</h3>
              <div className="text-gray-300">
                <p className="font-medium">{venue.name}</p>
                <p>{venue.address}</p>
                <p>{venue.city}, {venue.state} {venue.postalCode}</p>
                <p>{venue.country}</p>
                <p className="mt-2">Capacity: {venue.capacity.toLocaleString()} people</p>
              </div>
            </div>
          )}
        </div>

        {/* Rating Section (placeholder) */}
        <div className="bg-[#23232b] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Event Rating</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-lg font-semibold">4.8</span>
            <span className="text-gray-400">(125 reviews)</span>
          </div>
          <p className="text-gray-300">
            This event has received excellent reviews from attendees. Book now to experience it yourself!
          </p>
        </div>
      </div>
    </div>
  );
}

