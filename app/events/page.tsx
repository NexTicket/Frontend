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

  // Scroll to center the selected poster
  useEffect(() => {
    if (carouselRef.current && featuredEvents.length > 0) {
      const container = carouselRef.current;
      const child = container.children[carouselIndex] as HTMLElement;
      if (child) {
        const offset = child.offsetLeft - (container.offsetWidth / 2) + (child.offsetWidth / 2);
        container.scrollTo({ left: offset, behavior: 'smooth' });
      }
    }
  }, [carouselIndex, featuredEvents.length]);

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
        {/* Background image (use first featured event as bg) */}
        <Image src={getEventImage(featuredEvents[carouselIndex])} alt="Hero Background" fill className="object-cover brightness-50" priority />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10" />
        {/* Carousel */}
        <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-center h-full">
          {/* Left Arrow */}
          <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-3 z-30"><span className="text-3xl">&#8592;</span></button>
          {/* Posters Row */}
          <div ref={carouselRef} className="flex gap-6 overflow-hidden px-16 w-full items-center justify-center">
            {featuredEvents.map((event, idx) => {
              // Center poster is large, sides are smaller and faded
              const isActive = idx === carouselIndex;
              return (
                <div
                  key={event.id}
                  className={`relative flex-shrink-0 transition-all duration-500 ${isActive ? 'scale-110 z-20' : 'scale-90 opacity-60 z-10'} cursor-pointer`}
                  style={{width: isActive ? 260 : 180, height: isActive ? 390 : 270, scrollSnapAlign: 'center'}}
                  onClick={() => setCarouselIndex(idx)}
                >
                  <Image src={getEventImage(event)} alt={event.title} fill className="object-cover rounded-xl shadow-2xl" />
                  {/* Overlay details only for active */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-xl flex flex-col gap-3">
                      <h2 className="text-3xl font-bold mb-1">{event.title}</h2>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-yellow-400 font-bold">8.5</span>
                        <span className="text-xs text-gray-300">(2019)</span>
                        <span className="text-xs text-gray-300">{event.category}</span>
                        <span className="text-xs text-gray-300">{event.category}</span>
                      </div>
                      <p className="text-gray-200 text-sm line-clamp-2 mb-2">{event.description}</p>
                      <div className="flex gap-2">
                        <Link href={`/events/${event.id}`}><Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">Buy a Ticket</Button></Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Right Arrow */}
          <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-3 z-30"><span className="text-3xl">&#8594;</span></button>
        </div>
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
                      <span>{event.category}</span>
                      <span className="text-yellow-400">8.5</span>
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
                      <span>{event.category}</span>
                      <span className="text-yellow-400">8.5</span>
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

