"use client"

import React,{ useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Search, 
  Users, 
  Calendar,
  Phone,
  Mail,
  Filter
} from 'lucide-react';
import { mockVenues, mockEvents } from '@/lib/mock-data';

export default function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');

  const cities = ['all', ...new Set(mockVenues.map(venue => venue.city))];
  const capacityRanges = [
    { label: 'All Capacities', value: 'all' },
    { label: 'Small (0-500)', value: 'small' },
    { label: 'Medium (501-2000)', value: 'medium' },
    { label: 'Large (2001-10000)', value: 'large' },
    { label: 'Stadium (10000+)', value: 'stadium' }
  ];

  const filteredVenues = mockVenues
    .filter(venue => 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(venue => selectedCity === 'all' || venue.city === selectedCity)
    .filter(venue => {
      if (capacityFilter === 'all') return true;
      if (capacityFilter === 'small') return venue.capacity <= 500;
      if (capacityFilter === 'medium') return venue.capacity > 500 && venue.capacity <= 2000;
      if (capacityFilter === 'large') return venue.capacity > 2000 && venue.capacity <= 10000;
      if (capacityFilter === 'stadium') return venue.capacity > 10000;
      return true;
    });

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

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              {cities.map(city => (
                <option key={city} value={city}>
                  {city === 'all' ? 'All Cities' : city}
                </option>
              ))}
            </select>

            {/* Capacity Filter */}
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              {capacityRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('all');
                setCapacityFilter('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
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
                      {venue.capacity.toLocaleString()}
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
                  <div className="flex flex-wrap gap-1 mb-4">
                    {venue.amenities.slice(0, 3).map(amenity => (
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

                  {/* Contact Info */}
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
      </div>
    </div>
  );
}
