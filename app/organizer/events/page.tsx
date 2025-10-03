"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  MapPin,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit,
  MoreVertical,
  Clock,
  DollarSign,
  Tag,
  Ticket,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

type EventStatus = 'all' | 'upcoming' | 'today' | 'past';
type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc' | 'capacity-asc' | 'capacity-desc';
type ViewMode = 'grid' | 'list';

export default function OrganizerEventsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedVenue, setSelectedVenue] = useState<string>('all');

  // Get today's date for comparison
  const today = new Date().toISOString().split('T')[0];

  // Get unique categories for filters
  const categories = useMemo(() => {
    const cats = [...new Set(mockEvents.map(event => event.category))];
    return cats.sort();
  }, []);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    const filtered = mockEvents.filter(event => {
      // Search filter
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const eventDate = event.date;
        if (statusFilter === 'upcoming') {
          matchesStatus = eventDate > today;
        } else if (statusFilter === 'today') {
          matchesStatus = eventDate === today;
        } else if (statusFilter === 'past') {
          matchesStatus = eventDate < today;
        }
      }

      // Category filter
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      // Price range filter
      const matchesPrice = event.price >= priceRange[0] && event.price <= priceRange[1];

      // Venue filter
      const matchesVenue = selectedVenue === 'all' || event.venue === selectedVenue;

      return matchesSearch && matchesStatus && matchesCategory && matchesPrice && matchesVenue;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'capacity-asc':
          return a.capacity - b.capacity;
        case 'capacity-desc':
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, categoryFilter, sortBy, priceRange, selectedVenue, today]);

  // Get event statistics
  const eventStats = useMemo(() => {
    const upcoming = mockEvents.filter(event => event.date > today).length;
    const todayCount = mockEvents.filter(event => event.date === today).length;
    const past = mockEvents.filter(event => event.date < today).length;
    const totalRevenue = mockEvents.reduce((sum, event) => 
      sum + (event.price * (event.capacity - event.availableTickets)), 0
    );
    const totalTicketsSold = mockEvents.reduce((sum, event) => 
      sum + (event.capacity - event.availableTickets), 0
    );

    return {
      total: mockEvents.length,
      upcoming,
      today: todayCount,
      past,
      totalRevenue,
      totalTicketsSold
    };
  }, [today]);

  const getEventStatus = (eventDate: string) => {
    if (eventDate > today) return 'upcoming';
    if (eventDate === today) return 'today';
    return 'past';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'upcoming': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-700';
    case 'today': 
      return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 border border-green-200 dark:border-green-700';
    case 'past': 
      return 'bg-gray-200 text-gray-700 dark:bg-gray-800/70 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-200';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriceRange([0, 500]);
    setSelectedVenue('all');
    setSortBy('date-asc');
  };

  const EventCard = ({ event }: { event: typeof mockEvents[0] }) => {
    const status = getEventStatus(event.date);
    const ticketsSold = event.capacity - event.availableTickets;
    const salesPercentage = Math.round((ticketsSold / event.capacity) * 100);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-card rounded-lg border p-6 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:border-primary/20 dark:hover:border-primary/30"
      >
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg mb-4 flex items-center justify-center relative group-hover:from-primary/30 group-hover:to-primary/20 dark:group-hover:from-primary/40 dark:group-hover:to-primary/30 transition-all duration-300">
          <Calendar className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} backdrop-blur-sm`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.venue}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              {event.category}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-t border-b">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Sold</p>
              <p className="font-semibold">{ticketsSold.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="font-semibold">{event.availableTickets.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sales Progress</span>
              <span>{salesPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary/90"
                style={{ width: `${salesPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors duration-300">${event.price}</span>
            <div className="flex items-center space-x-2">
              <Link href={`/organizer/events/${event.id}/view`}>
                <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/organizer/events/${event.id}/edit`}>
                <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const EventListItem = ({ event }: { event: typeof mockEvents[0] }) => {
    const status = getEventStatus(event.date);
    const ticketsSold = event.capacity - event.availableTickets;
    const salesPercentage = Math.round((ticketsSold / event.capacity) * 100);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className="bg-card rounded-lg border p-4 hover:shadow-md hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:border-primary/20 dark:hover:border-primary/30"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 dark:group-hover:from-primary/40 dark:group-hover:to-primary/30 transition-all duration-300">
            <Calendar className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{event.description}</p>
                
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
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.venue}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} backdrop-blur-sm`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-bold text-primary group-hover:text-primary/80 transition-colors duration-300">${event.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="font-semibold">{ticketsSold}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="font-semibold">{event.availableTickets}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="font-semibold">{salesPercentage}%</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link href={`/organizer/events/${event.id}/view`}>
                    <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/organizer/dashboard">
              <Button variant="outline" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 transition-all duration-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Events</h1>
              <p className="text-muted-foreground">Manage and monitor all your events</p>
            </div>
          </div>
          <Link href="/organizer/events/new">
            <Button className="hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-4 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Total Events</p>
                <p className="text-2xl font-bold">{eventStats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Upcoming</p>
                <p className="text-2xl font-bold">{eventStats.upcoming}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 hover:shadow-lg hover:shadow-green-500/5 dark:hover:shadow-green-500/10 transition-all duration-300 group cursor-pointer hover:border-green-200 dark:hover:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Today</p>
                <p className="text-2xl font-bold">{eventStats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 hover:shadow-lg hover:shadow-green-500/5 dark:hover:shadow-green-500/10 transition-all duration-300 group cursor-pointer hover:border-green-200 dark:hover:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Total Revenue</p>
                <p className="text-xl font-bold">${eventStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 hover:shadow-lg hover:shadow-purple-500/5 dark:hover:shadow-purple-500/10 transition-all duration-300 group cursor-pointer hover:border-purple-200 dark:hover:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Tickets Sold</p>
                <p className="text-xl font-bold">{eventStats.totalTicketsSold.toLocaleString()}</p>
              </div>
              <Ticket className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Horizontal Search Bar */}
        <div className="mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-6 rounded-lg border border-border">
              {/* Search Input */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events by title, description, venue, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Filters Row */}
              <div className="flex gap-3 w-full sm:w-auto">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus)}
                  className="px-4 py-3 border rounded-lg bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[130px]"
                >
                  <option value="all" className="bg-background">All Events</option>
                  <option value="upcoming" className="bg-gray-800">Upcoming</option>
                  <option value="today" className="bg-gray-800">Today</option>
                  <option value="past" className="bg-gray-800">Past</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border rounded-lg bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[140px]"
                >
                  <option value="all" className="bg-background">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-background">{category}</option>
                  ))}
                </select>

                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-3 border rounded-lg bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[150px]"
                >
                  <option value="date-asc" className="bg-background">Date (Earliest)</option>
                  <option value="date-desc" className="bg-background">Date (Latest)</option>
                  <option value="title-asc" className="bg-background">Title (A-Z)</option>
                  <option value="title-desc" className="bg-background">Title (Z-A)</option>
                  <option value="price-asc" className="bg-background">Price (Low-High)</option>
                  <option value="price-desc" className="bg-background">Price (High-Low)</option>
                </select>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="px-6 py-3 text-white border hover:bg-green-500/10 transition-colors whitespace-nowrap"
                  style={{ borderColor: '#CBF83E50' }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear
                </Button>

                {/* View Mode Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-6 py-3 text-white border hover:bg-green-500/10 transition-colors whitespace-nowrap"
                  style={{ borderColor: '#CBF83E50' }}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredAndSortedEvents.length}</span> of <span className="font-semibold text-foreground">{mockEvents.length}</span> events
          </p>
        </div>

        {/* Events Display */}
        <div className="space-y-6">
          {filteredAndSortedEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new event.
              </p>
              <Link href="/organizer/events/new">
                <Button className="hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredAndSortedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredAndSortedEvents.map(event => (
                    <EventListItem key={event.id} event={event} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
