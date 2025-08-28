"use client"

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Search, 
  Filter, 
  Loader2,
  Calendar,
  Tag
} from 'lucide-react';
import { fetchEvents } from '@/lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEvents();
        let eventsArray: any[] = [];
        if (Array.isArray(data)) {
          eventsArray = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          eventsArray = data.data;
        } else if (data && data.events && Array.isArray(data.events)) {
          eventsArray = data.events;
        } else if (data && typeof data === 'object') {
          eventsArray = [data];
        }
        setEvents(eventsArray);
      } catch (err) {
        console.error('Error fetching events:', err);
        let message = 'Failed to load events.';
        if (err instanceof Error) message += ' ' + err.message;
        setError(message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...new Set(events.map((e: any) => e.category).filter(Boolean))] as string[];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e: any) => {
        const q = searchTerm.toLowerCase();
  return (
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.venue?.name?.toLowerCase().includes(q)
        );
      })
      .filter((e: any) => (selectedCategory === 'all' ? true : e.category === selectedCategory));
  }, [events, searchTerm, selectedCategory]);

  if (loading) {
              return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading events...</h3>
              <p className="text-muted-foreground">Please wait while we fetch the latest events</p>
                      </div>
                      </div>
                    </div>
                </div>
              );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-destructive mb-2">Error Loading Events</h3>
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
    <div className="min-h-screen " style={{ backgroundColor: '#191C24' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-white font-bold text-foreground mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-muted-foreground text-white">
            Find amazing events happening near you
          </p>
      </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg  p-6 mb-8" style={{ backgroundColor: '#191C24', borderColor: '#CBF83E'+'50' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ backgroundColor: '#191C24' }}>
            {/* Search */}
            <div className="relative" style={{ backgroundColor: '#191C24' }}>
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"  />
            <input
              type="text"
                placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md placeholder-white bg-background " style={{  backgroundColor: '#191C24' , borderColor: '#CBF83E'+'50' }}
            />
            </div>
            
            {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-md text-white bg-background" style={{ backgroundColor: '#191C24' , borderColor: '#CBF83E'+'50' }}
              >
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
                ))}
              </select>

            {/* Clear Filters */}
              <Button
                variant="outline"
              style={{  backgroundColor: '#191C24' , borderColor: '#CBF83E'+'50' }}
              className='text-white hover:text-white'
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
              </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ backgroundColor: '#191C24' }}>
          {filteredEvents.map((event: any) => {
            return (
              <div key={event.id} className="bg-card rounded-lg border shadow-lg overflow-hidden hover:shadow-xl transition-shadow" style={{  backgroundColor: '#191C24' , borderColor: '#CBF83E'+'50' }}>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title || 'Event'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <Calendar className="h-12 w-12 text-primary" />
                  )}
                  <Calendar className="h-12 w-12 text-primary hidden" />
          </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl text-white font-semibold">{event.title || 'Untitled Event'}</h3>
                    <div className="flex items-center text-white text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 mr-1 text-white" />
                      {event.category || 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mb-4" style={{ color: '#198754' }}>
                    <Calendar className="h-4 w-4  mr-1"  style={{ color: '#CBF83E' }} />
                    {event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : 'Date TBA'}
          </div>

                  {event.venue && (
                    <div className="mb-4 p-2 bg-muted rounded-lg" style={{ backgroundColor: '#191C24' , borderColor: '#CBF83E'+'50' }}>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-2" /> {event.venue?.name || 'Venue TBA'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/events/${event.id || event._id || 'unknown'}`} className="flex-1">
                      <Button className="w-full" style={{ backgroundColor: '#0D6EFD' }}>View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
            </div>

        {/* No results */}
        {!loading && events.length === 0 && !error && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events in database</h3>
            <p className="text-muted-foreground mb-4">
              There are no events available in the database yet.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
              </div>
            )}
        
        {/* No filtered results */}
        {!loading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events match your filters</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria to find events.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
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
