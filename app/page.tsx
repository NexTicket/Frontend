"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
//import { getWelcomeMessage } from '@/lib/auth-utils';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Star, 
  ArrowRight,
  Music,
  Trophy,
  Theater,
  Heart,
  Shield,
  Zap,
  Clock
} from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { userProfile } = useAuth();
  
  const featuredEvents = mockEvents.slice(0, 6);
  
  const categories = [
    { name: 'Music', icon: Music, color: 'bg-pink-500' },
    { name: 'Sports', icon: Trophy, color: 'bg-blue-500' },
    { name: 'Theater', icon: Theater, color: 'bg-purple-500' },
    { name: 'Comedy', icon: Heart, color: 'bg-red-500' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your tickets are protected with industry-standard security'
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Get your tickets immediately after purchase'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our team is here to help whenever you need assistance'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* User Welcome Message */}
            {userProfile && (
              <div className="mb-6 p-4 bg-background/10 backdrop-blur-sm rounded-lg">
              <p className="text-lg text-primary-foreground/90">
                Welcome back, {userProfile.firstName || 'User'}!
              </p>
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Find and book tickets for concerts, sports, theater, and more
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background/10 backdrop-blur-sm rounded-lg">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search events, artists, venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="bg-background text-primary hover:bg-background/90">
                  Search Events
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/events">
                  Browse All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/venues">
                  Explore Venues
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
            <p className="text-xl text-muted-foreground">
              Discover events by category
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href={`/events?category=${category.name.toLowerCase()}`}
                  className="group p-6 bg-card rounded-lg border hover:border-primary transition-colors"
                >
                  <div className={`${category.color} p-4 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Events</h2>
            <p className="text-xl text-muted-foreground">
              Don't miss these amazing upcoming events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {event.category}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-muted-foreground">4.8</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.venue}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.availableTickets} tickets available
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${event.price}
                    </span>
                    <Button asChild>
                      <Link href={`/events/${event.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose NexTicket?</h2>
            <p className="text-xl text-muted-foreground">
              The best way to discover and book event tickets
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary p-4 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Next Event?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of event-goers who trust NexTicket for their entertainment needs
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/events">
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/auth/signup">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
