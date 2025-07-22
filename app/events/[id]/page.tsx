"use client"

import { useState } from 'react';
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
  Ticket
} from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState('general');
  const [activeTab, setActiveTab] = useState('summary');
  
  const event = mockEvents.find(e => e.id === params.id);
  const venue = event ? mockVenues.find(v => v.id === event.venueId) : null;

  // Check if this is a movie
  const isMovie = event && event.tags.includes('movie');

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

  const ticketTypes = [
    {
      id: 'general',
      name: 'General Admission',
      price: event.price,
      description: 'Standard entry to the event',
      available: event.availableTickets
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      price: event.price * 2,
      description: 'Premium access with exclusive perks',
      available: Math.floor(event.availableTickets * 0.1)
    },
    {
      id: 'student',
      name: 'Student Discount',
      price: Math.floor(event.price * 0.8),
      description: 'Special pricing for students with valid ID',
      available: Math.floor(event.availableTickets * 0.3)
    }
  ];

  return (
    <div className="min-h-screen bg-[#18181c] text-white">
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
              <div className="flex gap-8 items-center w-full">
                {/* Movie Poster */}
                <div className="flex-shrink-0">
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    width={320}
                    height={480}
                    className="w-80 h-[480px] object-cover rounded-xl shadow-2xl"
                  />
                  <div className="mt-4 text-center">
                    <span className="bg-gray-700 text-white text-sm px-3 py-1 rounded">2D</span>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="flex-1 max-w-2xl">
                  <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
                  <p className="text-xl text-gray-300 mb-4">
                    {event.title.includes('Sinhala') || event.title.includes('සිංහල') ? 'SINHALA' : 'ENGLISH'}
                  </p>
                  
                  {/* Genre Tags */}
                  <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 border border-gray-600 rounded text-sm uppercase">
                      {event.category}
                    </span>
                    {event.tags
                      .filter(tag => tag !== 'movie')
                      .slice(0, 2)
                      .map(tag => (
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
                      <span>{new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>
                        {event.tags.includes('action') ? '2 hrs 30 mins' : 
                         event.tags.includes('horror') ? '1 hr 45 mins' :
                         event.tags.includes('comedy') ? '2 hrs 10 mins' :
                         '2 hrs 20 mins'}
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-8 mb-8">
                    <button 
                      className={`pb-2 ${activeTab === 'summary' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                      onClick={() => setActiveTab('summary')}
                    >
                      Summary
                    </button>
                    <button 
                      className={`pb-2 ${activeTab === 'reviews' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      User Reviews
                    </button>
                    <button 
                      className={`pb-2 ${activeTab === 'critic' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                      onClick={() => setActiveTab('critic')}
                    >
                      Critic Reviews
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="mb-8">
                    {activeTab === 'summary' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">SYNOPSIS</h3>
                        <p className="text-gray-300 leading-relaxed">{event.description}</p>
                      </div>
                    )}
                    
                    {activeTab === 'reviews' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">USER REVIEWS</h3>
                        <div className="space-y-4">
                          <div className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center mb-2">
                              <div className="flex text-yellow-400">
                                {'★'.repeat(5)}
                              </div>
                              <span className="ml-2 text-gray-400">- MovieFan123</span>
                            </div>
                            <p className="text-gray-300">&ldquo;Absolutely amazing! One of the best films I&rsquo;ve seen this year.&rdquo;</p>
                          </div>
                          <div className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center mb-2">
                              <div className="flex text-yellow-400">
                                {'★'.repeat(4)}{'☆'}
                              </div>
                              <span className="ml-2 text-gray-400">- CinemaLover</span>
                            </div>
                            <p className="text-gray-300">&ldquo;Great story and excellent performances. Highly recommended!&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'critic' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">CRITIC REVIEWS</h3>
                        <div className="space-y-4">
                          <div className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center mb-2">
                              <span className="text-green-400 font-bold">85%</span>
                              <span className="ml-2 text-gray-400">- Rotten Tomatoes</span>
                            </div>
                            <p className="text-gray-300">&ldquo;A masterfully crafted film that delivers on all fronts.&rdquo;</p>
                          </div>
                          <div className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center mb-2">
                              <span className="text-green-400 font-bold">8.2/10</span>
                              <span className="ml-2 text-gray-400">- IMDb</span>
                            </div>
                            <p className="text-gray-300">&ldquo;Outstanding cinematography and compelling storytelling.&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Share */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">f</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">t</span>
                    </div>
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">P</span>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            {/* Play Button */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <div className="w-0 h-0 border-l-8 border-r-0 border-t-6 border-b-6 border-l-white border-t-transparent border-b-transparent ml-1"></div>
              </button>
            </div>
          </div>

          {/* Cast Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold mb-8">CAST</h2>
            <div className="flex gap-6">
              {(() => {
                // Dynamic cast based on movie
                const getCast = () => {
                  if (event.title.includes('Deadpool')) {
                    return [
                      { name: 'Ryan Reynolds', role: 'Deadpool' },
                      { name: 'Hugh Jackman', role: 'Wolverine' },
                      { name: 'Emma Corrin', role: 'Cassandra Nova' }
                    ];
                  } else if (event.title.includes('Batman')) {
                    return [
                      { name: 'Robert Pattinson', role: 'Batman' },
                      { name: 'Zoë Kravitz', role: 'Catwoman' },
                      { name: 'Paul Dano', role: 'The Riddler' }
                    ];
                  } else if (event.title.includes('Inception')) {
                    return [
                      { name: 'Leonardo DiCaprio', role: 'Dom Cobb' },
                      { name: 'Marion Cotillard', role: 'Mal' },
                      { name: 'Tom Hardy', role: 'Eames' }
                    ];
                  }
                  return [
                    { name: 'Lead Actor', role: 'Main Character' },
                    { name: 'Supporting Actor', role: 'Supporting Role' },
                    { name: 'Featured Actor', role: 'Key Role' }
                  ];
                };
                
                return getCast().map((actor, i) => (
                  <div key={i} className="text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full mb-3 flex items-center justify-center">
                      <span className="text-2xl">{actor.name.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-medium">{actor.name}</p>
                    <p className="text-xs text-gray-400">{actor.role}</p>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Movie Booking Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="bg-[#23232b] rounded-xl border border-gray-700 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Movie Info Summary */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-6">BOOK YOUR TICKETS</h2>
                  
                  {/* Movie Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-blue-400 text-sm font-medium mb-2">DATE</div>
                      <div className="text-white">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short' 
                        })}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-blue-400 text-sm font-medium mb-2">TIME</div>
                      <div className="text-white">{event.time}</div>
                      <div className="text-gray-400 text-sm">
                        {event.tags.includes('action') ? '2h 30m' : 
                         event.tags.includes('horror') ? '1h 45m' :
                         event.tags.includes('comedy') ? '2h 10m' :
                         '2h 20m'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-blue-400 text-sm font-medium mb-2">VENUE</div>
                      <div className="text-white">{event.venue}</div>
                      <div className="text-gray-400 text-sm">Premium</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-blue-400 text-sm font-medium mb-2">PRICE</div>
                      <div className="text-white">${event.price}</div>
                      <div className="text-gray-400 text-sm">+ fees</div>
                    </div>
                  </div>

                  {/* Ticket Types for Movies */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">SELECT TICKET TYPE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          id: 'standard',
                          name: 'Standard',
                          price: event.price,
                          description: 'Regular cinema experience',
                          features: ['Standard seating', 'Digital projection']
                        },
                        {
                          id: 'premium',
                          name: 'Premium',
                          price: Math.floor(event.price * 1.5),
                          description: 'Enhanced comfort & quality',
                          features: ['Luxury seating', 'Dolby Atmos', 'Premium snacks']
                        },
                        {
                          id: 'vip',
                          name: 'VIP Experience',
                          price: event.price * 2,
                          description: 'Ultimate movie experience',
                          features: ['Recliner seats', 'Waiter service', 'Exclusive lounge']
                        }
                      ].map(ticket => (
                        <div
                          key={ticket.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-500 ${
                            selectedTicketType === ticket.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600'
                          }`}
                          onClick={() => setSelectedTicketType(ticket.id)}
                        >
                          <div className="text-center">
                            <h4 className="font-semibold text-white mb-2">{ticket.name}</h4>
                            <div className="text-2xl font-bold text-blue-400 mb-2">${ticket.price}</div>
                            <p className="text-sm text-gray-400 mb-3">{ticket.description}</p>
                            <div className="text-xs text-gray-500">
                              {ticket.features.map((feature, i) => (
                                <div key={i}>• {feature}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-[#2a2a35] rounded-lg p-6 sticky top-8">
                    <h3 className="text-lg font-semibold mb-4">BOOKING SUMMARY</h3>
                    
                    {/* Selected Movie Info */}
                    <div className="mb-6">
                      <div className="flex gap-3 mb-4">
                        <Image 
                          src={event.image} 
                          alt={event.title}
                          width={60}
                          height={90}
                          className="w-15 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{event.title}</h4>
                          <p className="text-gray-400 text-xs">{event.venue}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(event.date).toLocaleDateString()} • {event.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ticket ({selectedTicketType})</span>
                        <span className="text-white">
                          ${selectedTicketType === 'premium' ? Math.floor(event.price * 1.5) : 
                            selectedTicketType === 'vip' ? event.price * 2 : event.price}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Convenience Fee</span>
                        <span className="text-white">$3.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Service Tax</span>
                        <span className="text-white">$2.00</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total Amount</span>
                          <span className="text-blue-400">
                            ${(selectedTicketType === 'premium' ? Math.floor(event.price * 1.5) : 
                              selectedTicketType === 'vip' ? event.price * 2 : event.price) + 5}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Link href={`/events/${event.id}/seating`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium">
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
        // Regular Event Layout
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href="/events" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-lg mb-8 flex items-center justify-center">
                <Image 
                  src={event.image} 
                  alt={event.title} 
                  width={800}
                  height={450}
                  className="w-full h-full object-cover rounded-lg" 
                />
              </div>

              {/* Event Info */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full">
                      {event.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      {event.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-400">
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
                      className="text-gray-400 hover:text-white"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                
                <div className="flex items-center text-gray-400 mb-6">
                  <div className="flex items-center mr-6">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">4.8 (234 reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.organizer}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Event Details */}
              <div className="bg-[#23232b] rounded-lg border border-gray-700 p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-400 mr-3" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-gray-400">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-400 mr-3" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-gray-400">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-400 mr-3" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-gray-400">{event.venue}</p>
                      {venue && (
                        <p className="text-sm text-gray-500">
                          {venue.address}, {venue.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-400 mr-3" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-gray-400">
                        {event.availableTickets} of {event.capacity} available
                      </p>
                    </div>
                  </div>
                </div>

                {venue && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Link href={`/venues/${venue.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        View Venue Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Venue Info */}
              {venue && (
                <div className="bg-[#23232b] rounded-lg border border-gray-700 p-6">
                  <h3 className="text-xl font-semibold mb-4">About the Venue</h3>
                  <p className="text-gray-400 mb-4">{venue.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map(amenity => (
                      <span key={amenity} className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#23232b] rounded-lg border border-gray-700 p-6 sticky top-8">
                <h3 className="text-xl font-semibold mb-6">Book Your Tickets</h3>
                
                {/* Ticket Types */}
                <div className="space-y-4 mb-6">
                  {ticketTypes.map(ticket => (
                    <div
                      key={ticket.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicketType === ticket.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-blue-500/50'
                      }`}
                      onClick={() => setSelectedTicketType(ticket.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{ticket.name}</h4>
                        <span className="font-bold text-blue-400">${ticket.price}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {ticket.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.available} available
                      </p>
                    </div>
                  ))}
                </div>

                {/* Booking Actions */}
                <div className="space-y-4">
                  <Link href={`/events/${event.id}/seating`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      <Ticket className="mr-2 h-5 w-5" />
                      Select Seats
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    Add to Watchlist
                  </Button>
                </div>

                {/* Price Summary */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Service fee</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>${(ticketTypes.find(t => t.id === selectedTicketType)?.price || 0) + 5}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
