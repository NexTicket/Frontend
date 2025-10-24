"use client"

import React,{ useState, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Share2, 
  Heart,
  Star,
  ArrowLeft,
  Ticket,
  Play,
  Facebook,
  Twitter
} from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';
import { fetchEventById, fetchVenueById } from '@/lib/api';
import { getEventBulkTickets, BulkTicket } from '@/lib/api_ticket';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [loadedEvent, setLoadedEvent] = useState<any | null>(null);
  const [loadedVenue, setLoadedVenue] = useState<any | null>(null);
  const [bulkTickets, setBulkTickets] = useState<BulkTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch event data
        const data = await fetchEventById(id);
        const evt = (data?.data) || data;
        setLoadedEvent(evt);
        
        // Fetch venue data if venue ID exists
        if (evt?.venueId || evt?.venue?.id) {
          const venueId = evt.venueId || evt.venue.id;
          try {
            const venueData = await fetchVenueById(venueId);
            const venue = venueData?.data || venueData;
            setLoadedVenue(venue);
          } catch (err) {
            console.error('Failed to fetch venue:', err);
          }
        }
        
        // Fetch bulk tickets for this event
        try {
          const tickets = await getEventBulkTickets(parseInt(id));
          setBulkTickets(tickets || []);
        } catch (err) {
          console.error('Failed to fetch bulk tickets:', err);
          // Don't show error to user, just log it
        }
        
      } catch (e: any) {
        console.error('Failed to fetch event by id', e);
        setError(e?.message || 'Failed to load event');
        setLoadedEvent(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);
  
  // Fallback to mock if API fails
  const event = loadedEvent || mockEvents.find(e => String(e.id) === String(id));
  const venue = loadedVenue || event?.venue || mockVenues.find((v: any) => String(v.id) === String(event?.venueId));

  // Check if this is a movie
  const isMovie = event && Array.isArray(event.tags) && event.tags.includes('movie');
  
  // Convert bulk tickets to ticket types format for UI
  const ticketTypes = bulkTickets.length > 0 
    ? bulkTickets.map(ticket => ({
        id: ticket.id.toString(), // Use unique bulk ticket ID instead of seat_type
        bulkTicketId: ticket.id, // Keep bulk ticket ID for reference
        seatType: ticket.seat_type, // Keep seat type for selection logic
        name: ticket.seat_type === 'VIP' ? 'VIP Pass' : ticket.seat_type === 'REGULAR' ? 'General Admission' : ticket.seat_type,
        price: ticket.price,
        description: ticket.seat_type === 'VIP' 
          ? 'Premium access with exclusive perks' 
          : 'Standard entry to the event',
        available: ticket.available_seats,
        sectionName: ticket.seat_prefix
      }))
    : [
        // Fallback mock data if no bulk tickets
        {
          id: 'general',
          bulkTicketId: 0,
          seatType: 'REGULAR',
          name: 'General Admission',
          price: (event?.price ? event.price : 100) * 300,
          description: 'Standard entry to the event',
          available: event?.availableTickets ?? 0,
          sectionName: 'General'
        }
      ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The event you are looking for does not exist or has been removed.
          </p>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-foreground">
      {isMovie ? (
        // Movie Layout
        <>
          {/* Movie Hero Section */}
          <div className="relative w-full h-screen overflow-hidden">
            {/* Background Movie Poster */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image})` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
            
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="flex gap-8 items-start w-full">
                {/* Movie Poster */}
                <div className="flex-shrink-0">
                  <Image 
                    src={event.image || '/placeholder.png'} 
                    alt={event.title}
                    width={320}
                    height={480}
                    className="w-80 h-[480px] object-cover rounded-xl shadow-2xl"
                  />
                  <div className="mt-4 text-center">
                    <span className="bg-gray-700 text-foreground text-sm px-3 py-1 rounded">2D</span>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="flex-1 max-w-2xl">
                  {/* Title and Language aligned with top of poster */}
                  <h1 className="text-5xl font-bold mb-2 uppercase">{event.title}</h1>
                  <p className="text-xl text-gray-300 mb-8 uppercase tracking-wide">
                    {String(event.title || '').includes('Sinhala') || String(event.title || '').includes('සිංහල') ? 'SINHALA' : 'ENGLISH'}
                  </p>
                  
                  {/* Play Button */}
                  <div className="mb-8">
                    <button className="w-20 h-20 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/35 transition-all duration-300 hover:scale-110 shadow-2xl border-2 border-white/30">
                      <Play className="h-7 w-7 text-foreground ml-1" fill="white" />
                    </button>
                  </div>

                  {/* Genre Tags */}
                  <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 border border-gray-600 rounded text-sm uppercase">
                      {event.category}
                    </span>
                    {Array.isArray(event.tags) && event.tags
                      .filter((tag: string) => tag !== 'movie')
                      .slice(0, 2)
                      .map((tag: string) => (
                        <span key={tag} className="px-3 py-1 border border-gray-600 rounded text-sm uppercase">
                          {tag}
                        </span>
                      ))
                    }
                  </div>

                  {/* Movie Info */}
                  <div className="flex items-center gap-6 mb-6 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{new Date(event.startDate || event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{event.startTime || event.time}</span>
                    </div>
                  </div>

                  {/* Social Share */}
                  <div className="flex gap-4">
                    <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                      <Facebook className="h-5 w-5 text-foreground" />
                    </button>
                    <button className="w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors">
                      <Twitter className="h-5 w-5 text-foreground" />
                    </button>
                    <button className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                      <Share2 className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Content Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Content Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-700 relative">
              <button 
                className={`pb-4 px-2 transition-all duration-300 ease-out relative ${
                  activeTab === 'summary' 
                    ? 'text-blue-400 transform scale-105' 
                    : 'text-gray-400 hover:text-gray-300 hover:scale-102'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
                {activeTab === 'summary' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 animate-pulse" />
                )}
              </button>
              <button 
                className={`pb-4 px-2 transition-all duration-300 ease-out relative ${
                  activeTab === 'reviews' 
                    ? 'text-blue-400 transform scale-105' 
                    : 'text-gray-400 hover:text-gray-300 hover:scale-102'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                User Reviews
                {activeTab === 'reviews' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 animate-pulse" />
                )}
              </button>
              <button 
                className={`pb-4 px-2 transition-all duration-300 ease-out relative ${
                  activeTab === 'critic' 
                    ? 'text-blue-400 transform scale-105' 
                    : 'text-gray-400 hover:text-gray-300 hover:scale-102'
                }`}
                onClick={() => setActiveTab('critic')}
              >
                Critic Reviews
                {activeTab === 'critic' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Movie Booking Section */}
            <div className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tab Content Area */}
                <div className="lg:col-span-2 relative overflow-hidden">
                  <div className="relative min-h-[600px]">
                    {/* Summary Tab */}
                    <div 
                      className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                        activeTab === 'summary' 
                          ? 'opacity-100 translate-x-0 z-10' 
                          : 'opacity-0 translate-x-8 z-0 pointer-events-none'
                      }`}
                    >
                      <div className="space-y-12">
                        {/* Synopsis */}
                        <div className={`transform transition-all duration-700 ${activeTab === 'summary' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
                          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            SYNOPSIS
                          </h3>
                          <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
                        </div>

                        {/* Cast Section */}
                        <div className={`transform transition-all duration-700 ${activeTab === 'summary' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                          <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            CAST
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {(() => {
                              // Dynamic cast based on movie
                              const getCast = () => {
                                if (event.title.includes('Deadpool')) {
                                  return [
                                    { name: 'Ryan Reynolds', role: 'Deadpool' },
                                    { name: 'Hugh Jackman', role: 'Wolverine' },
                                    { name: 'Emma Corrin', role: 'Cassandra Nova' },
                                    { name: 'Matthew Macfadyen', role: 'Paradox' },
                                    { name: 'Dafne Keen', role: 'X-23' },
                                    { name: 'Jon Favreau', role: 'Happy Hogan' }
                                  ];
                                } else if (event.title.includes('Batman')) {
                                  return [
                                    { name: 'Robert Pattinson', role: 'Batman' },
                                    { name: 'Zoë Kravitz', role: 'Catwoman' },
                                    { name: 'Paul Dano', role: 'The Riddler' },
                                    { name: 'Jeffrey Wright', role: 'Commissioner Gordon' },
                                    { name: 'John Turturro', role: 'Carmine Falcone' },
                                    { name: 'Andy Serkis', role: 'Alfred' }
                                  ];
                                } else if (event.title.includes('Inception')) {
                                  return [
                                    { name: 'Leonardo DiCaprio', role: 'Dom Cobb' },
                                    { name: 'Marion Cotillard', role: 'Mal' },
                                    { name: 'Tom Hardy', role: 'Eames' },
                                    { name: 'Ellen Page', role: 'Ariadne' },
                                    { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
                                    { name: 'Cillian Murphy', role: 'Robert Fischer' }
                                  ];
                                }
                                return [
                                  { name: 'Lead Actor', role: 'Main Character' },
                                  { name: 'Supporting Actor', role: 'Supporting Role' },
                                  { name: 'Featured Actor', role: 'Key Role' },
                                  { name: 'Character Actor', role: 'Important Role' },
                                  { name: 'Guest Actor', role: 'Special Appearance' },
                                  { name: 'Voice Actor', role: 'Narrator' }
                                ];
                              };
                              
                              return getCast().map((actor, i) => (
                                <div 
                                  key={i} 
                                  className={`text-center transform transition-all duration-500 hover:scale-110 hover:-translate-y-2 ${
                                    activeTab === 'summary' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                  }`}
                                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                                >
                                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full mb-3 flex items-center justify-center mx-auto shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300">
                                    <span className="text-xl font-semibold">{actor.name.charAt(0)}</span>
                                  </div>
                                  <p className="text-sm font-medium text-foreground">{actor.name}</p>
                                  <p className="text-xs text-gray-400">{actor.role}</p>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Technical Details */}
                        <div className={`transform transition-all duration-700 ${activeTab === 'summary' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            TECHNICAL DETAILS
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                              {
                                label: 'Director',
                                value: event.title.includes('Deadpool') ? 'Shawn Levy' :
                                       event.title.includes('Batman') ? 'Matt Reeves' :
                                       event.title.includes('Inception') ? 'Christopher Nolan' :
                                       'John Director'
                              },
                              { label: 'Genre', value: event.category },
                              { label: 'Rating', value: 'R' },
                              {
                                label: 'Language',
                                value: String(event.title || '').includes('Sinhala') || String(event.title || '').includes('සිංහල') ? 'Sinhala' : 'English'
                              }
                            ].map((detail, i) => (
                              <div 
                                key={i}
                                className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 transform ${
                                  activeTab === 'summary' ? '-translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                                }`}
                                style={{ transitionDelay: `${500 + i * 150}ms` }}
                              >
                                <h4 className="text-blue-400 font-medium mb-2">{detail.label}</h4>
                                <p className="text-gray-300">{detail.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Reviews Tab */}
                    <div 
                      className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                        activeTab === 'reviews' 
                          ? 'opacity-100 translate-x-0 z-10' 
                          : 'opacity-0 translate-x-8 z-0 pointer-events-none'
                      }`}
                    >
                      <div>
                        <h3 className={`text-2xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent transform transition-all duration-700 ${
                          activeTab === 'reviews' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`}>
                          USER REVIEWS
                        </h3>
                        <div className="space-y-6">
                          {[
                            {
                              rating: 5,
                              user: 'MovieFan123',
                              review: 'Absolutely amazing! One of the best films I\'ve seen this year. The action sequences are incredible and the character development is top-notch.'
                            },
                            {
                              rating: 4,
                              user: 'CinemaLover',
                              review: 'Great story and excellent performances. Highly recommended! The cinematography is stunning and the soundtrack perfectly complements the mood.'
                            },
                            {
                              rating: 5,
                              user: 'FilmCritic2024',
                              review: 'A masterpiece of modern cinema. The director has outdone themselves with this incredible piece of art that will be remembered for years to come.'
                            },
                            {
                              rating: 4,
                              user: 'ActionMovieFan',
                              review: 'Non-stop entertainment from start to finish. The special effects are mind-blowing and the storyline keeps you engaged throughout.'
                            }
                          ].map((review, i) => (
                            <div 
                              key={i} 
                              className={`border-l-4 border-yellow-500 pl-6 py-4 bg-gray-800/30 rounded-r-lg hover:bg-gray-800/50 transition-all duration-300 hover:translate-x-2 transform ${
                                activeTab === 'reviews' ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                              }`}
                              style={{ transitionDelay: `${200 + i * 200}ms` }}
                            >
                              <div className="flex items-center mb-3">
                                <div className="flex text-yellow-400 mr-3">
                                  {Array.from({ length: 5 }, (_, starIndex) => (
                                    <span 
                                      key={starIndex}
                                      className={`transition-all duration-300 ${
                                        starIndex < review.rating ? 'text-yellow-400 animate-pulse' : 'text-gray-600'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-gray-400">- {review.user}</span>
                              </div>
                              <p className="text-gray-300 leading-relaxed">&ldquo;{review.review}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Critic Reviews Tab */}
                    <div 
                      className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                        activeTab === 'critic' 
                          ? 'opacity-100 translate-x-0 z-10' 
                          : 'opacity-0 translate-x-8 z-0 pointer-events-none'
                      }`}
                    >
                      <div>
                        <h3 className={`text-2xl font-bold mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent transform transition-all duration-700 ${
                          activeTab === 'critic' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`}>
                          CRITIC REVIEWS
                        </h3>
                        <div className="space-y-6">
                          {[
                            {
                              source: 'Rotten Tomatoes',
                              score: '85%',
                              scoreColor: 'text-green-400',
                              review: 'A masterfully crafted film that delivers on all fronts. The performances are outstanding and the direction is flawless.'
                            },
                            {
                              source: 'IMDb',
                              score: '8.2/10',
                              scoreColor: 'text-green-400',
                              review: 'Outstanding cinematography and compelling storytelling. A must-watch for fans of the genre.'
                            },
                            {
                              source: 'Metacritic',
                              score: '78/100',
                              scoreColor: 'text-green-400',
                              review: 'Visually stunning with exceptional performances. The film successfully balances action with emotional depth.'
                            },
                            {
                              source: 'The Guardian',
                              score: '4/5',
                              scoreColor: 'text-green-400',
                              review: 'A remarkable achievement in filmmaking. The director has created something truly special that resonates with audiences.'
                            }
                          ].map((review, i) => (
                            <div 
                              key={i} 
                              className={`border-l-4 border-green-500 pl-6 py-4 bg-gray-800/30 rounded-r-lg hover:bg-gray-800/50 transition-all duration-300 hover:translate-x-2 transform ${
                                activeTab === 'critic' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                              }`}
                              style={{ transitionDelay: `${200 + i * 200}ms` }}
                            >
                              <div className="flex items-center mb-3">
                                <span className={`font-bold text-xl mr-3 ${review.scoreColor} transition-all duration-500 ${activeTab === 'critic' ? 'animate-pulse' : ''}`}>{review.score}</span>
                                <span className="text-gray-400">- {review.source}</span>
                              </div>
                              <p className="text-gray-300 leading-relaxed">&ldquo;{review.review}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Summary Only */}
                <div className="lg:col-span-1">
                  <div className=" rounded-lg p-6 sticky top-8">
                    <h3 className="text-lg font-semibold mb-4">BOOKING SUMMARY</h3>
                    
                    {/* Selected Movie Info */}
                    <div className="mb-6">
                      <div className="flex gap-3 mb-4">
                        <Image 
                          src={event.image || '/placeholder.png'} 
                          alt={event.title}
                          width={60}
                          height={90}
                          className="w-15 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                          <p className="text-gray-400 text-xs">{event.venue?.name || event.venue || 'TBA'}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(event.startDate || event.date).toLocaleDateString()} • {event.startTime || event.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Link href={`/events/${event.id}/seating`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-foreground py-3 text-base font-medium">
                          <Ticket className="mr-2 h-5 w-5" />
                          SELECT SEATS
                        </Button>
                      </Link>
                      
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3">
                        <Heart className="mr-2 h-4 w-4" />
                        ADD TO WATCHLIST
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 pt-6 border-t border-gray-600">
                      <div className="text-xs text-gray-500 space-y-2">
                        <p>• Cancellation available up to 2 hours before showtime</p>
                        <p>• Mobile tickets available</p>
                        <p>• Outside food & beverages not allowed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Regular Event Layout with Entrance Animations
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {/* Back Button */}
          <div className="animate-slideInFromLeft" style={{ animationDelay: '0.1s' }}>
            <Link href="/events" className="inline-flex items-center text-gray-400 hover:text-foreground mb-6 transition-all duration-300 hover:translate-x-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-lg mb-8 flex items-center justify-center animate-slideInFromTop overflow-hidden" style={{ animationDelay: '0.2s' }}>
                <Image 
                  src={event.image || '/placeholder.png'} 
                  alt={event.title} 
                  width={800}
                  height={450}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-700 hover:scale-105" 
                />
              </div>

              {/* Event Info */}
              <div className="mb-8 animate-slideInFromRight" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full transition-all duration-300 hover:bg-blue-600/30 hover:scale-105">
                      {event.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      {Array.isArray(event.tags) && event.tags.map((tag: string, index: number) => (
                        <span 
                          key={tag} 
                          className="text-xs text-gray-400 transition-all duration-300 hover:text-blue-400 hover:scale-110"
                          style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className="transition-all duration-300 hover:scale-110"
                    >
                      <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 animate-pulse' : 'hover:text-red-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-110">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slideInFromBottom" style={{ animationDelay: '0.4s' }}>
                  {event.title}
                </h1>
                
                <div className="flex items-center text-gray-400 mb-6 animate-slideInFromLeft" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center mr-6 transition-all duration-300 hover:text-yellow-400">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">4.8 (234 reviews)</span>
                  </div>
                  <div className="flex items-center transition-all duration-300 hover:text-blue-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.organizer || 'Organizer'}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                  {event.description}
                </p>
              </div>

              {/* Event Details */}
              <div className=" rounded-lg border border-gray-700 p-6 mb-8 animate-slideInFromLeft transition-all duration-500 hover:border-blue-500/30" style={{ animationDelay: '0.7s' }}>
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center animate-slideInFromBottom" style={{ animationDelay: '0.8s' }}>
                    <Calendar className="h-5 w-5 text-blue-400 mr-3 transition-all duration-300 hover:scale-110" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-400">
                        {new Date(event.startDate || event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center animate-slideInFromBottom" style={{ animationDelay: '0.9s' }}>
                    <Clock className="h-5 w-5 text-blue-400 mr-3 transition-all duration-300 hover:scale-110" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-gray-400">{event.startTime || event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center animate-slideInFromBottom" style={{ animationDelay: '1.0s' }}>
                    <MapPin className="h-5 w-5 text-blue-400 mr-3 transition-all duration-300 hover:scale-110" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-gray-400">{event.venue?.name || event.venue || 'TBA'}</p>
                    </div>
                  </div>

                  <div className="flex items-center animate-slideInFromBottom" style={{ animationDelay: '1.1s' }}>
                    <Users className="h-5 w-5 text-blue-400 mr-3 transition-all duration-300 hover:scale-110" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-gray-400">
                        {(event.availableTickets ?? 0)} of {(event.capacity ?? 0)} available
                      </p>
                    </div>
                  </div>
                </div>

                {venue && (
                  <div className="mt-6 pt-6 border-t border-gray-600 animate-fadeIn" style={{ animationDelay: '1.2s' }}>
                    <Link href={`/venues/${venue.id || venue._id || 'unknown'}`}>
                      <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 hover:border-blue-500">
                        View Venue Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Venue Info */}
              {venue && (
                <div className="rounded-lg border border-gray-700 p-6 animate-slideInFromRight transition-all duration-500 hover:border-blue-500/30" style={{ animationDelay: '1.3s' }}>
                  <h3 className="text-xl font-semibold mb-4">About the Venue</h3>
                  
                  {/* Venue Image */}
                  {venue.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <Image 
                        src={venue.image} 
                        alt={venue.name}
                        width={600}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Venue Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-gray-400">Location</p>
                        <p className="text-foreground">{venue.location || 'Address not available'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-gray-400">Capacity</p>
                        <p className="text-foreground">{venue.capacity ? `${venue.capacity.toLocaleString()} people` : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Venue Description */}
                  <p className="text-gray-400 mb-4">{venue.description || 'No description provided.'}</p>
                  
                  {/* View Full Details Button */}
                  <Link href={`/venues/${venue.id || venue._id || 'unknown'}`}>
                    <Button variant="outline" className="w-full transition-all duration-300 hover:scale-105 hover:border-blue-500">
                      View Full Venue Details
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className=" rounded-lg border border-gray-700 p-6 sticky top-8 animate-slideInFromRight transition-all duration-500 hover:border-blue-500/30" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-semibold mb-6">Available Tickets</h3>
                
                {/* No Tickets Available Message */}
                {bulkTickets.length === 0 && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <p className="text-sm text-yellow-400 text-center">
                      Tickets are not yet available for this event. Please check back later.
                    </p>
                  </div>
                )}
                
                {/* Ticket Types - Display Only */}
                <div className="space-y-4 mb-6">
                  {ticketTypes.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="p-4 border border-gray-600 rounded-lg transition-all duration-300 hover:border-blue-500/50 animate-slideInFromBottom"
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{ticket.name}</h4>
                          {ticket.sectionName && (
                            <p className="text-xs text-blue-400 mt-1">Section: {ticket.sectionName}</p>
                          )}
                        </div>
                        <span className="font-bold text-blue-400">LKR {ticket.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{ticket.available} seats available</span>
                        {ticket.available < 10 && ticket.available > 0 && (
                          <span className="text-yellow-500">Only {ticket.available} left!</span>
                        )}
                        {ticket.available === 0 && (
                          <span className="text-red-500">Sold Out</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Booking Actions */}
                <div className="space-y-4 animate-slideInFromBottom" style={{ animationDelay: '0.8s' }}>
                  <Link href={`/events/${event.id}/seating`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25" size="lg">
                      <Ticket className="mr-2 h-5 w-5" />
                      Select Seats
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
