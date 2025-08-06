'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, MapPin, Users, Clock, TrendingUp } from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'event' | 'venue' | 'category';
  subtitle?: string;
  icon?: React.ReactNode;
  url?: string;
}

interface SmartSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearch({ 
  onSearch, 
  placeholder = "Search events, venues, artists...",
  className = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Popular categories and trending searches
  const popularCategories = [
    { name: 'Music Concerts', icon: <Calendar className="h-4 w-4" />, type: 'category' as const },
    { name: 'Sports Events', icon: <Users className="h-4 w-4" />, type: 'category' as const },
    { name: 'Theater Shows', icon: <Clock className="h-4 w-4" />, type: 'category' as const },
  ];

  const trendingSearches = [
    'Rock Concerts',
    'Basketball Games',
    'Comedy Shows',
    'Music Festivals'
  ];

  useEffect(() => {
    if (query.length === 0) {
      // Show popular categories when empty
      setSuggestions([
        ...popularCategories.map(cat => ({
          id: cat.name,
          title: cat.name,
          type: cat.type,
          subtitle: 'Popular category',
          icon: cat.icon
        })),
        ...trendingSearches.map(search => ({
          id: search,
          title: search,
          type: 'category' as const,
          subtitle: 'Trending',
          icon: <TrendingUp className="h-4 w-4 text-red-500" />
        }))
      ]);
    } else if (query.length >= 2) {
      // Search through events and venues
      const eventResults = mockEvents
        .filter(event => 
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.category.toLowerCase().includes(query.toLowerCase()) ||
          event.venue.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map(event => ({
          id: event.id,
          title: event.title,
          type: 'event' as const,
          subtitle: `${event.venue} • ${new Date(event.date).toLocaleDateString()}`,
          icon: <Calendar className="h-4 w-4 text-blue-500" />,
          url: `/events/${event.id}`
        }));

      const venueResults = mockVenues
        .filter(venue => 
          venue.name.toLowerCase().includes(query.toLowerCase()) ||
          venue.address.toLowerCase().includes(query.toLowerCase()) ||
          venue.city.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map(venue => ({
          id: venue.id,
          title: venue.name,
          type: 'venue' as const,
          subtitle: `${venue.city} • ${venue.capacity} capacity`,
          icon: <MapPin className="h-4 w-4 text-green-500" />,
          url: `/venues/${venue.id}`
        }));

      setSuggestions([...eventResults, ...venueResults]);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      window.location.href = suggestion.url;
    } else {
      setQuery(suggestion.title);
      handleSearch(suggestion.title);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      onSearch?.(searchTerm);
      // Navigate to search results page
      window.location.href = `/events?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-500"
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="py-2">
              {query.length === 0 && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                  Popular & Trending
                </div>
              )}
              
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                    selectedIndex === index ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.type === 'event' 
                        ? 'bg-blue-100 text-blue-800' 
                        : suggestion.type === 'venue'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {suggestion.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
              <p className="text-sm">Try searching for events, venues, or categories</p>
            </div>
          ) : null}

          {query.length >= 2 && (
            <div className="border-t px-4 py-3 bg-gray-50">
              <button
                onClick={() => handleSearch()}
                className="w-full text-left text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Search for "{query}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
