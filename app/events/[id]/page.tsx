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
  Ticket,
  Play,
  Facebook,
  Twitter
} from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState('standard');
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
      price: event.price * 300, // Convert to LKR (approx 1 USD = 300 LKR)
      description: 'Standard entry to the event',
      available: event.availableTickets
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      price: event.price * 300 * 2,
      description: 'Premium access with exclusive perks',
      available: Math.floor(event.availableTickets * 0.1)
    },
    {
      id: 'student',
      name: 'Student Discount',
      price: Math.floor(event.price * 300 * 0.8),
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
              <div className="flex gap-8 items-start w-full">
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
                  {/* Title and Language aligned with top of poster */}
                  <h1 className="text-5xl font-bold mb-2 uppercase">{event.title}</h1>
                  <p className="text-xl text-gray-300 mb-8 uppercase tracking-wide">
                    {event.title.includes('Sinhala') || event.title.includes('සිංහල') ? 'SINHALA' : 'ENGLISH'}
                  </p>
                  
                  {/* Play Button */}
                  <div className="mb-8">
                    <button className="w-20 h-20 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/35 transition-all duration-300 hover:scale-110 shadow-2xl border-2 border-white/30">
                      <Play className="h-7 w-7 text-white ml-1" fill="white" />
                    </button>
                  </div>

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

                  {/* Social Share */}
                  <div className="flex gap-4">
                    <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                      <Facebook className="h-5 w-5 text-white" />
                    </button>
                    <button className="w-10 h-10 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors">
                      <Twitter className="h-5 w-5 text-white" />
                    </button>
                    <button className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Content Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-700">
              <button 
                className={`pb-4 px-2 transition-colors ${
                  activeTab === 'summary' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
              <button 
                className={`pb-4 px-2 transition-colors ${
                  activeTab === 'reviews' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                User Reviews
              </button>
              <button 
                className={`pb-4 px-2 transition-colors ${
                  activeTab === 'critic' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('critic')}
              >
                Critic Reviews
              </button>
            </div>

            {/* Movie Booking Section */}
            <div className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tab Content Area */}
                <div className="lg:col-span-2">
                  {activeTab === 'summary' && (
                    <div className="space-y-12">
                      {/* Synopsis */}
                      <div>
                        <h3 className="text-2xl font-bold mb-6">SYNOPSIS</h3>
                        <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
                      </div>

                      {/* Cast Section */}
                      <div>
                        <h3 className="text-2xl font-bold mb-8">CAST</h3>
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
                              <div key={i} className="text-center">
                                <div className="w-20 h-20 bg-gray-700 rounded-full mb-3 flex items-center justify-center mx-auto">
                                  <span className="text-xl font-semibold">{actor.name.charAt(0)}</span>
                                </div>
                                <p className="text-sm font-medium text-white">{actor.name}</p>
                                <p className="text-xs text-gray-400">{actor.role}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div>
                        <h3 className="text-2xl font-bold mb-6">TECHNICAL DETAILS</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <h4 className="text-blue-400 font-medium mb-2">Director</h4>
                            <p className="text-gray-300">
                              {event.title.includes('Deadpool') ? 'Shawn Levy' :
                               event.title.includes('Batman') ? 'Matt Reeves' :
                               event.title.includes('Inception') ? 'Christopher Nolan' :
                               'John Director'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-blue-400 font-medium mb-2">Genre</h4>
                            <p className="text-gray-300">{event.category}</p>
                          </div>
                          <div>
                            <h4 className="text-blue-400 font-medium mb-2">Rating</h4>
                            <p className="text-gray-300">R</p>
                          </div>
                          <div>
                            <h4 className="text-blue-400 font-medium mb-2">Language</h4>
                            <p className="text-gray-300">
                              {event.title.includes('Sinhala') || event.title.includes('සිංහල') ? 'Sinhala' : 'English'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div>
                      <h3 className="text-2xl font-bold mb-8">USER REVIEWS</h3>
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
                          <div key={i} className="border-l-4 border-blue-500 pl-6 py-4">
                            <div className="flex items-center mb-3">
                              <div className="flex text-yellow-400 mr-3">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                              <span className="text-gray-400">- {review.user}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">&ldquo;{review.review}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'critic' && (
                    <div>
                      <h3 className="text-2xl font-bold mb-8">CRITIC REVIEWS</h3>
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
                          <div key={i} className="border-l-4 border-blue-500 pl-6 py-4">
                            <div className="flex items-center mb-3">
                              <span className={`font-bold text-xl mr-3 ${review.scoreColor}`}>{review.score}</span>
                              <span className="text-gray-400">- {review.source}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">&ldquo;{review.review}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Summary Only */}
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
                          LKR {(selectedTicketType === 'premium' ? Math.floor(event.price * 300 * 1.5) : 
                            selectedTicketType === 'vip' ? event.price * 300 * 2 : event.price * 300).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Convenience Fee</span>
                        <span className="text-white">LKR 900</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Service Tax</span>
                        <span className="text-white">LKR 600</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total Amount</span>
                          <span className="text-blue-400">
                            LKR {((selectedTicketType === 'premium' ? Math.floor(event.price * 300 * 1.5) : 
                              selectedTicketType === 'vip' ? event.price * 300 * 2 : event.price * 300) + 1500).toLocaleString()}
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
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
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
                        <p className="text-sm text-gray-400">
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
                  <div className="mt-6 pt-6 border-t border-gray-600">
                    <Link href={`/venues/${venue.id}`}>
                      <Button variant="outline" size="sm">
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
                        <span className="font-bold text-blue-400">LKR {ticket.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {ticket.description}
                      </p>
                      <p className="text-xs text-gray-400">
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
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Service fee</span>
                    <span>LKR 1,500</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>LKR {((ticketTypes.find(t => t.id === selectedTicketType)?.price || 0) + 1500).toLocaleString()}</span>
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
