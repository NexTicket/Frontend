"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Search, Filter, Clock, Users } from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const categories = ['all', 'Music', 'Technology', 'Theater', 'Food', 'Art'];

  const filteredEvents = mockEvents
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(event => selectedCategory === 'all' || event.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-muted-foreground">
            Find amazing events happening near you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8 hover:shadow-md transition-shadow duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-background text-foreground">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            >
              <option value="date" className="bg-background text-foreground">Sort by Date</option>
              <option value="price" className="bg-background text-foreground">Sort by Price</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('date');
              }}
              className="hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-border">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center hover:from-primary/30 hover:to-primary/20 transition-all duration-300">
                <Calendar className="h-12 w-12 text-primary" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors">
                    {event.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {event.tags.slice(0, 2).join(', ')}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-card-foreground hover:text-primary transition-colors cursor-pointer">
                  {event.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Users className="h-4 w-4 mr-2" />
                    {event.availableTickets} tickets available
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting from</p>
                    <p className="text-2xl font-bold text-primary">
                      ${event.price}
                    </p>
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button className="hover:shadow-md hover:scale-105 transition-all duration-200">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
