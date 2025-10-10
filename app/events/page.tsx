"use client"

import React,{ useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Search } from 'lucide-react';
import { fetchEvents } from '@/lib/api';
import Image from 'next/image';
import { useRef } from 'react';
import { Loading } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ui/error-display';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  category: string;
  type: string;
  status: string;
  image?: string;
  venueId?: number;
  Tenant?: {
    id: number;
    name: string;
  };
  venue?: {
    id: number;
    name: string;
    location?: string;
  };
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // Changed from 'movies' to 'all'
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const categories = ['all', 'MUSIC', 'SPORTS', 'THEATER', 'COMEDY', 'CONFERENCE', 'FESTIVAL', 'WORKSHOP', 'OTHER'];
  const movieCategories = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'];
  
  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        console.log('🎯 Loading events from API...');
        const response = await fetchEvents();
        console.log('🎯 Events loaded:', response);
        
        if (response && response.data) {
          setEvents(response.data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('❌ Failed to load events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);
  
  // Filter events based on active tab and type
  const allEvents = events;
  const movieEvents = allEvents.filter(event => 
    event.type === 'MOVIE'
  );
  const nonMovieEvents = allEvents.filter(event => event.type !== 'MOVIE');
  
  const currentEvents = activeTab === 'movies' ? movieEvents : 
                       activeTab === 'events' ? nonMovieEvents : allEvents;
  const featuredEvents = allEvents.slice(0, 5); // Common hero shows all events

  // Carousel navigation
  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? Math.max(0, featuredEvents.length - 1) : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === Math.max(0, featuredEvents.length - 1) ? 0 : prev + 1));

  // Auto-play carousel
  useEffect(() => {
    if (featuredEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  // Pause auto-play on hover
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (featuredEvents.length <= 1) return;

    if (isHovered) return; // Pause when hovered

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [carouselIndex, featuredEvents.length, isHovered]);

  const filteredEvents = currentEvents
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(event => selectedCategory === 'all' || event.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (sortBy === 'price') {
        // Since we don't have price in the API data, we'll use a default sorting
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Helper function to format date
  // const formatEventDate = (startDate: string, startTime?: string) => {
  //   const date = new Date(startDate);
  //   const dateStr = date.toLocaleDateString();
  //   return startTime ? `${dateStr} at ${startTime}` : dateStr;
  // };

  // Helper function to get placeholder image
  const getEventImage = (event: Event) => {
    return event.image || '/Images/event-placeholder.jpg';
  };

  if (loading) {
    // Commented out original loading implementation
    // return (
    //   <div className="min-h-screen bg-[#18181c] text-white flex items-center justify-center">
    //     <div className="text-center">
    //       <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    //       <h2 className="text-2xl font-bold mb-2">Loading Events...</h2>
    //       <p className="text-gray-400">Fetching the latest events for you</p>
    //     </div>
    //   </div>
    // );

    // Using new global Loading component
    return (
      <div className="min-h-screen bg-[#18181c] text-white flex items-center justify-center">
        <Loading
          type="wave"
          size="lg"
          text="Loading Events..."
          className="text-white"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#18181c] text-white flex items-center justify-center p-4">
        <ErrorDisplay
          type="error"
          title="Failed to Load Events"
          message={error}
          variant="card"
          onRetry={() => window.location.reload()}
          className="max-w-md"
        />
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return (
      <div className="min-h-screen bg-[#18181c] text-white flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Events Available</h2>
          <p className="text-gray-400">Check back later for upcoming events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181c] text-white">
      {/* Hero Section with Background */}
      <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background image with smooth transition */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          <Image
            src={getEventImage(featuredEvents[carouselIndex])}
            alt="Hero Background"
            fill
            className="object-cover brightness-50 scale-105 transition-transform duration-1000 ease-in-out"
            priority
          />
        </div>
        {/* Enhanced Overlay with better gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10" />

        {/* Carousel */}
        <div
          className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-center h-full px-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Posters Row with improved spacing */}
          <div ref={carouselRef} className="flex gap-8 overflow-hidden px-20 w-full items-center justify-center">
            {featuredEvents.map((event, idx) => {
              // Center poster is large, sides are smaller and faded
              const isActive = idx === carouselIndex;
              const distance = Math.abs(idx - carouselIndex);
              const scale = isActive ? 1.1 : distance === 1 ? 0.95 : 0.85;
              const opacity = isActive ? 1 : distance === 1 ? 0.7 : 0.4;

              return (
                <div
                  key={event.id}
                  className={`relative flex-shrink-0 transition-all duration-500 ease-in-out cursor-pointer transform-gpu ${isActive ? 'drop-shadow-2xl' : ''}`}
                  style={{
                    width: isActive ? 280 : 200,
                    height: isActive ? 420 : 300,
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    zIndex: isActive ? 30 : 20 - distance,
                    scrollSnapAlign: 'center',
                    filter: isActive ? 'drop-shadow(0 25px 50px rgba(168, 85, 247, 0.4))' : 'none'
                  }}
                  onClick={() => setCarouselIndex(idx)}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 ease-in-out">
                    <Image
                      src={getEventImage(event)}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                    />
                    {/* Subtle border glow for active item */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 shadow-lg shadow-blue-400/20"></div>
                    )}
                  </div>

                  {/* Simplified Overlay - just title for active */}
                  {isActive && (
                    <div className="absolute bottom-6 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                      <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">{event.title}</h2>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {featuredEvents.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              className={`transition-all duration-500 rounded-full ${
                idx === carouselIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg shadow-blue-500/50'
                  : 'w-3 h-3 bg-white/40 hover:bg-white/70 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        {!isHovered && featuredEvents.length > 1 && (
          <div className="absolute top-6 right-6 z-30">
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">Auto</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter/Search Bar - Horizontal Layout */}
      <div className="max-w-6xl mx-auto mt-10 mb-8">
        <div className="bg-[#23232b] rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'movies' ? 'movies' : 'events'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded bg-[#18181c] border border-[#333] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded bg-[#18181c] border border-[#333] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">
                {activeTab === 'movies' ? 'All Genres' : 'All Event Types'}
              </option>
              {(activeTab === 'movies' ? movieCategories : categories.slice(1)).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort By Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded bg-[#18181c] border border-[#333] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">{activeTab === 'movies' ? 'Show Time' : 'Event Date'}</option>
              <option value="price">{activeTab === 'movies' ? 'Ticket Price' : 'Price'}</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('date');
              }}
              className="border-white text-white hover:bg-white/10"
            >
              <Filter className="mr-2 h-4 w-4" />Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-[#23232b] rounded-lg p-1 w-fit">
            <button
              onClick={() => {
                setActiveTab('movies');
                setSelectedCategory('all'); // Reset category when switching tabs
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'movies'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a32]'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => {
                setActiveTab('events');
                setSelectedCategory('all'); // Reset category when switching tabs
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a32]'
              }`}
            >
              Events
            </button>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured {activeTab === 'movies' ? 'Movies' : 'Events'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {currentEvents.slice(0, 4).map(event => (
              <div key={event.id} className="bg-[#23232b] rounded-xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out relative group">
                <div className="relative w-full h-64 overflow-hidden">
                  <Image src={getEventImage(event)} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-md">Featured</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Hover Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-semibold mb-2 text-white">{event.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                      <span className="bg-blue-600/80 px-2 py-1 rounded text-white font-medium">{event.category}</span>
                      <span className="text-yellow-400 font-bold">8.5</span>
                    </div>
                    <p className="text-gray-200 text-sm line-clamp-2 mb-4">{event.description}</p>
                    <Link href={`/events/${event.id}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full transition-colors duration-300">
                        Buy a Ticket
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Events Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All {activeTab === 'movies' ? 'Movies' : 'Events'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-[#23232b] rounded-xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out relative group">
                <div className="relative w-full h-64 overflow-hidden">
                  <Image src={getEventImage(event)} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Hover Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-semibold mb-2 text-white">{event.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                      <span className="bg-blue-600/80 px-2 py-1 rounded text-white font-medium">{event.category}</span>
                      <span className="text-yellow-400 font-bold">8.5</span>
                    </div>
                    <p className="text-gray-200 text-sm line-clamp-2 mb-4">{event.description}</p>
                    <Link href={`/events/${event.id}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full">
                        Buy a Ticket
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

