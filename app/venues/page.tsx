"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Search, 
  Users, 
  Calendar,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { mockVenues, mockEvents } from '@/lib/mock-data';
import { fetchVenues } from '@/lib/api';

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVenues()
      .then(data => {
        setVenues(data.data); // ← API response is likely { data: Venue[] }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching venues", err);
        // Fallback to mock data if API fails
        setVenues(mockVenues);
        setLoading(false);
      });
  }, []);

  const filteredVenues = (venues.length > 0 ? venues : mockVenues)
    .filter(venue => 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getUpcomingEvents = (venueId: string) => {
    return mockEvents.filter(event => event.venueId === venueId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Venues
          </h1>
          <p className="text-lg text-muted-foreground">
            Find amazing venues for your next event
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading venues...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-card rounded-lg border p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                  />
                </div>

                {/* Clear Search */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                  }}
                  disabled={!searchTerm}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Search
                </Button>
              </div>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue: any) => {
                const upcomingEvents = getUpcomingEvents(venue.id);
                
                return (
                  <div key={venue.id} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-primary" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">{venue.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {venue.capacity?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        {venue.address}, {venue.city}, {venue.state}
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {venue.description}
                      </p>

                      {/* Amenities */}
                      {venue.amenities && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {venue.amenities.slice(0, 3).map((amenity: string) => (
                            <span key={amenity} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                              +{venue.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      {venue.contact && (
                        <div className="space-y-1 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-2" />
                            {venue.contact.phone}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-2" />
                            {venue.contact.email}
                          </div>
                        </div>
                      )}

                      {/* Upcoming Events */}
                      {upcomingEvents.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Next: {upcomingEvents[0].title}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/venues/${venue.id}`} className="flex-1">
                          <Button className="w-full">View Details</Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No results */}
            {filteredVenues.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No venues found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria to find venues.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
