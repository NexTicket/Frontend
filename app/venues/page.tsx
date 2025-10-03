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
  Filter
} from 'lucide-react';
import { fetchVenues } from '@/lib/api';
import { Loading } from '@/components/ui/loading';

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');

  // Fetch venues from API
  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching venues from API...');
        console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/venues`);
        
        const data = await fetchVenues();
        console.log('API Response:', data);
        
        // Handle different response structures
        let venuesArray = [];
        if (Array.isArray(data)) {
          venuesArray = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          venuesArray = data.data;
        } else if (data && data.venues && Array.isArray(data.venues)) {
          venuesArray = data.venues;
        } else if (data && typeof data === 'object') {
          // If it's a single venue object, wrap it in an array
          venuesArray = [data];
        }
        
        console.log('Processed venues array:', venuesArray);
        console.log('Number of venues:', venuesArray.length);
        setVenues(venuesArray);
      } catch (err) {
        console.error('Error fetching venues:', err);
        let errorMessage = 'Failed to load venues. ';
        
        if (err instanceof Error) {
          if (err.message.includes('fetch')) {
            errorMessage += 'Unable to connect to the server. Make sure the backend is running on http://localhost:4000';
          } else {
            errorMessage += err.message;
          }
        } else {
          errorMessage += 'Unknown error occurred.';
        }
        
        setError(errorMessage);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  // Get unique cities from venues data - extract from location field
  const cities = ['all', ...new Set(venues.map((venue: any) => {
    // Extract city from location string like "123 Music Avenue, Downtown, NY 10001"
    if (venue.location && typeof venue.location === 'string') {
      const parts = venue.location.split(',');
      if (parts.length >= 2) {
        return parts[1].trim(); // Get the city part
      }
    }
    return venue.city || 'Unknown';
  }).filter(Boolean))];
  
  const capacityRanges = [
    { label: 'All Capacities', value: 'all' },
    { label: 'Small (0-500)', value: 'small' },
    { label: 'Medium (501-2000)', value: 'medium' },
    { label: 'Large (2001-10000)', value: 'large' },
    { label: 'Stadium (10000+)', value: 'stadium' }
  ];

  // Filter venues based on search and filters
  const filteredVenues = venues
    .filter((venue: any) => 
      venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((venue: any) => {
      if (selectedCity === 'all') return true;
      
      // Extract city from location field
      if (venue.location && typeof venue.location === 'string') {
        const parts = venue.location.split(',');
        if (parts.length >= 2) {
          const city = parts[1].trim();
          return city === selectedCity;
        }
      }
      return venue.city === selectedCity;
    })
    .filter((venue: any) => {
      if (capacityFilter === 'all') return true;
      const capacity = Number(venue.capacity) || 0;
      if (capacityFilter === 'small') return capacity <= 500;
      if (capacityFilter === 'medium') return capacity > 500 && capacity <= 2000;
      if (capacityFilter === 'large') return capacity > 2000 && capacity <= 10000;
      if (capacityFilter === 'stadium') return capacity > 10000;
      return true;
    });

  // For now, we'll mock upcoming events since we don't have events API integrated yet
  const getUpcomingEvents = (venueId: string) => {
    // Return empty array until events API is integrated
    return [];
  };

  if (loading) {
    // Commented out original loading implementation
    // return (
    //   <div className="min-h-screen bg-background">
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //       <div className="flex items-center justify-center py-12">
    //         <div className="text-center">
    //           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
    //           <h3 className="text-xl font-semibold mb-2">Loading venues...</h3>
    //           <p className="text-muted-foreground">Please wait while we fetch the latest venues</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );

    // Using new global Loading component
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading
          type="wave"
          size="lg"
          text="Loading venues..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-destructive mb-2">Error Loading Venues</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"  />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground border-border"
              />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background text-foreground border-border"
            >
              {cities.map((city: string) => (
                <option key={city} value={city}>
                  {city === 'all' ? 'All Cities' : city}
                </option>
              ))}
            </select>

            {/* Capacity Filter */}
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background text-foreground border-border"
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
              className="border-border text-foreground hover:bg-muted/50"
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

        {/* Debug Info - Remove this in production */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="bg-card rounded-lg border p-4 mb-8">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Total venues loaded: {venues.length}</p>
              <p>Filtered venues: {filteredVenues.length}</p>
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL}/venues</p>
              <p>Search term: "{searchTerm}"</p>
              <p>Selected city: {selectedCity}</p>
              <p>Capacity filter: {capacityFilter}</p>
              {venues.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Raw venue data (first venue):</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(venues[0], null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )} */}

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
            const upcomingEvents = getUpcomingEvents(venue.id);
            
            return (
              <div key={venue.id} className="bg-card rounded-lg border border-border shadow-lg overflow-hidden hover:shadow-xl transition-shadow">'
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
                  {venue.featuredImage || venue.image ? (
                    <img 
                      src={venue.featuredImage || venue.image} 
                      alt={venue.name || 'Venue'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <MapPin className="h-12 w-12 text-primary" />
                  )}
                  <MapPin className="h-12 w-12 text-primary hidden" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{venue.name || 'Unnamed Venue'}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {venue.capacity ? Number(venue.capacity).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    {venue.location || 'Location not specified'}
                  </div>

                  {/* <p className="text-muted-foreground mb-4 line-clamp-3">
                    {venue.description || 'No description available'}
                  </p> */}

                  {/* Tenant/Owner Info */}
                  {venue.tenant && (
                    <div className="mb-4 p-2 bg-muted/30 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Managed by:</strong> {venue.tenant.name}
                      </p>
                    </div>
                  )}

                  {/* Contact Info - Note: Not present in current API response */}
                  {(venue.contact?.phone || venue.contact?.email || venue.phone || venue.email) && (
                    <div className="space-y-1 mb-4" >
                      {(venue.contact?.phone || venue.phone) && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-2" />
                          {venue.contact?.phone || venue.phone}
                        </div>
                      )}
                      {(venue.contact?.email || venue.email) && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-2" />
                          {venue.contact?.email || venue.email}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upcoming Events - Currently disabled until events API is integrated */}
                  {false && upcomingEvents.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Events integration coming soon
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/venues/${venue.id || venue._id || 'unknown'}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Details</Button>
                    </Link>
                    <Button size="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {!loading && venues.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues in database</h3>
            <p className="text-muted-foreground mb-4">
              There are no venues available in the database yet.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        )}
        
        {/* No filtered results */}
        {!loading && venues.length > 0 && filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues match your filters</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria to find venues.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('all');
                setCapacityFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
