"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { OnboardingModal } from '@/components/ui/onboarding-modal';
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
  Clock,
  Building,
  UserCheck,
  Settings,
  Ticket,
  QrCode,
  Crown,
  Sparkles,
  TrendingUp,
  Globe,
  MessageCircle,
  HelpCircle,
  Plus
} from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';
import { SmartSearch } from '@/components/ui/smart-search';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{left: number, top: number, delay: number, duration: number}>>([]);
  const { userProfile } = useAuth();
  
  useEffect(() => {
    // Set client-side flag to prevent hydration mismatch
    setIsClient(true);
    setIsVisible(true);
    
    // Generate particles only on client-side to avoid hydration mismatch
    const generatedParticles = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2
    }));
    setParticles(generatedParticles);
    
    // Show onboarding for new users (only on client-side)
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('nexticket-onboarding-seen');
      if (!hasSeenOnboarding && userProfile) {
        setTimeout(() => setShowOnboarding(true), 1000);
      }
    }

    // Show floating action button after scroll
    const handleScroll = () => {
      setShowFAB(window.scrollY > 200);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [userProfile]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexticket-onboarding-seen', 'true');
    }
  };
  
  const featuredEvents = mockEvents.slice(0, 6);
  
  const categories = [
    { name: 'Music', icon: Music, color: 'bg-gradient-to-br from-pink-500 to-rose-600', description: 'Concerts & Festivals' },
    { name: 'Sports', icon: Trophy, color: 'bg-gradient-to-br from-blue-500 to-indigo-600', description: 'Games & Tournaments' },
    { name: 'Theater', icon: Theater, color: 'bg-gradient-to-br from-purple-500 to-violet-600', description: 'Plays & Shows' },
    { name: 'Comedy', icon: Heart, color: 'bg-gradient-to-br from-red-500 to-pink-600', description: 'Stand-up & Entertainment' },
  ];

  const roleFeatures = [
    {
      icon: Crown,
      title: 'Event Organizers',
      description: 'Create and manage events with venue selection and automated attendee management',
      color: 'from-amber-500 to-orange-600',
      features: ['Event Creation', 'Venue Selection', 'Attendee Analytics', 'Revenue Reports']
    },
    {
      icon: Building,
      title: 'Venue Owners',
      description: 'List venues with interactive seating charts and manage bookings',
      color: 'from-emerald-500 to-teal-600',
      features: ['Venue Listing', 'Seating Layouts', 'Booking Management', 'Revenue Tracking']
    },
    {
      icon: QrCode,
      title: 'Check-in Officers',
      description: 'Streamlined ticket validation and attendee check-in at events',
      color: 'from-violet-500 to-purple-600',
      features: ['QR Code Scanning', 'Real-time Validation', 'Attendee Tracking', 'Event Reports']
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your tickets are protected with industry-standard security and blockchain verification'
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Get your tickets immediately with QR codes and automated email notifications'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our dedicated team provides round-the-clock assistance for all your event needs'
    }
  ];

  const stats = [
    { label: 'Events Hosted', value: '50K+', icon: Calendar },
    { label: 'Happy Customers', value: '2M+', icon: Users },
    { label: 'Partner Venues', value: '5K+', icon: Building },
    { label: 'Cities Covered', value: '100+', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-purple-600 text-primary-foreground overflow-hidden">
        {/* Animated particles - only render on client-side */}
        <div className="absolute inset-0">
          {isClient && particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* User Welcome Message - only show after client hydration */}
            {isClient && userProfile && (
              <div className={`mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-700 delay-300 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}>
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  <p className="text-lg text-primary-foreground/90">
                    Welcome back, <span className="font-semibold">{userProfile.firstName || 'User'}</span>!
                  </p>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
              </div>
            )}
            
            <h1 className={`text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent transition-all duration-1000 delay-500 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              NexTicket Revolution
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 text-primary-foreground/90 transition-all duration-1000 delay-700 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              The Ultimate Event Ecosystem - Connecting Organizers, Venues & Audiences
            </p>
            
            {/* Enhanced Search Bar */}
            <div className={`max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-900 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="relative p-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SmartSearch 
                      placeholder="Search events, artists, venues..."
                      onSearch={(query) => {
                        setSearchQuery(query);
                        // Handle search functionality
                      }}
                    />
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg">
                    <Search className="mr-2 h-5 w-5" />
                    Search Events
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-1100 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-xl" asChild>
                <Link href="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  Browse All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300" asChild>
                <Link href="/venues">
                  <Building className="mr-2 h-5 w-5" />
                  Explore Venues
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-primary to-purple-600 p-4 rounded-full w-fit mx-auto mb-4 group-hover:shadow-2xl transition-all duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Empowering Every Role in Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform serves organizers, venue owners, and staff with specialized tools for seamless event management
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roleFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                    
                    {/* Feature list */}
                    <div className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                          <span className="text-sm text-gray-700 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover animation indicator */}
                    <div className={`mt-6 transform transition-all duration-300 ${
                      hoveredCard === index ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-70'
                    }`}>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Popular Event Categories</h2>
            <p className="text-xl text-gray-600">
              Discover events across diverse categories with immersive experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href={`/events?category=${category.name.toLowerCase()}`}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl overflow-hidden"
                >
                  {/* Background gradient effect */}
                  <div className={`absolute inset-0 ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="absolute inset-0 bg-white group-hover:bg-white/90 transition-colors duration-500"></div>
                  
                  <div className="relative text-center">
                    <div className={`${category.color} p-6 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-white transition-colors duration-500">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-500 text-sm">
                      {category.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Featured Events
            </h2>
            <p className="text-xl text-blue-100">
              Don't miss these spectacular upcoming experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="group bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Event Image Placeholder with Gradient */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Calendar className="h-16 w-16 text-white/80 relative z-10" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm rounded-full border border-white/30 font-medium">
                      {event.category}
                    </span>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  
                  {/* Trending indicator */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Hot</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 text-sm text-blue-100 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/30 p-1 rounded">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="font-medium">
                        {isClient ? new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500/30 p-1 rounded">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500/30 p-1 rounded">
                        <Users className="h-4 w-4" />
                      </div>
                      <span>{event.availableTickets} tickets available</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        ${event.price}
                      </span>
                      <p className="text-xs text-blue-200">Starting from</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transform hover:scale-105 transition-all duration-300" asChild>
                      <Link href={`/events/${event.id}`}>
                        <Ticket className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose NexTicket?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of event management with cutting-edge technology and unmatched reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group text-center relative bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary to-purple-600 p-6 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white relative overflow-hidden">
        {/* Animated elements */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/10 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-yellow-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Ready to Revolutionize Events?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join the NexTicket ecosystem and transform how events are created, managed, and experienced. 
              Whether you're an organizer, venue owner, or attendee - we've got you covered.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-10 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-xl" asChild>
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-10 py-4 rounded-xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link href="/auth/signup">
                <UserCheck className="mr-2 h-5 w-5" />
                Join NexTicket
              </Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-blue-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Bank-level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Instant Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button - only render on client-side */}
      {isClient && showFAB && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            {/* Main FAB */}
            <Button 
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-2xl transform hover:scale-110 transition-all duration-300 group"
              onClick={() => setShowOnboarding(true)}
            >
              <HelpCircle className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
            </Button>
            
            {/* Floating tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Need Help? Start Onboarding
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal - only render on client-side */}
      {isClient && (
        <OnboardingModal 
          isOpen={showOnboarding} 
          onClose={handleOnboardingClose}
        />
      )}
    </div>
  );
}
