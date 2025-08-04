"use client"

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Calendar,
  ArrowLeft,
  Star,
  Share2,
  Heart,
  Clock,
  Ticket
} from 'lucide-react';
import { mockVenues, mockEvents } from '@/lib/mock-data';
import { fetchVenueById } from '@/lib/api';

interface VenueDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const resolvedParams = use(params);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVenueById(resolvedParams.id)
      .then(data => {
        console.log(resolvedParams.id)//debugging
        setVenue(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching venue", err);
        // Fallback to mock data if API fails
        const mockVenue = mockVenues.find(v => v.id === resolvedParams.id);
        setVenue(mockVenue);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The venue you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/venues">
            <Button>Browse Venues</Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcomingEvents = mockEvents.filter(event => event.venueId === resolvedParams.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: `Events (${upcomingEvents.length})` },
    { id: 'amenities', label: 'Amenities' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/venues" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Venues
        </Link>

        {/* Venue Hero */}
        <div className="mb-8">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-6 flex items-center justify-center">
            <MapPin className="h-20 w-20 text-primary" />
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {venue.name}
              </h1>
              <div className="flex items-center text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {/* Capacity: {venue.capacity.toLocaleString()} */}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  4.7 (89 reviews)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">About This Venue</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {venue.description}
                  </p>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Venue Layout</h3>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Interactive venue map coming soon
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Getting Here</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">By Car</h4>
                      <p className="text-muted-foreground">
                        Multiple parking options available nearby. Street parking and paid lots within walking distance.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">By Public Transit</h4>
                      <p className="text-muted-foreground">
                        Accessible via subway and bus lines. Check local transit schedules for event times.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event: any) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{event.title}</h4>
                              <p className="text-muted-foreground text-sm mb-2">
                                {event.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {event.time}
                                </div>
                                <div className="flex items-center">
                                  <Ticket className="h-4 w-4 mr-1" />
                                  ${event.price}
                                </div>
                              </div>
                            </div>
                            <Link href={`/events/${event.id}`}>
                              <Button size="sm">View Event</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Venue Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venue.amenities?.map((amenity: string) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Wheelchair accessible entrances</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Accessible restrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Reserved accessible seating</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Hearing loop system</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {venue.contact?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-muted-foreground">{venue.contact.phone}</p>
                        </div>
                      </div>
                    )}
                    {venue.contact?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{venue.contact.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          {venue.address}<br />
                          {venue.city}, {venue.state} {venue.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        placeholder="Your message..."
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Venue
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
              </div>

              {upcomingEvents.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Next Event</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <h5 className="font-medium text-sm">{upcomingEvents[0].title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(upcomingEvents[0].date).toLocaleDateString()} at {upcomingEvents[0].time}
                    </p>
                    <Link href={`/events/${upcomingEvents[0].id}`}>
                      <Button size="sm" className="w-full mt-2">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
