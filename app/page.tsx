"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/ui/event-card';
import { useAuth } from '@/components/auth/auth-provider';
import { motion } from 'framer-motion';
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
  TrendingUp,
  Activity,
  Sparkles,
  Ticket
} from 'lucide-react';
import { fetchEvents, fetchVenues } from '@/lib/api';

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { userProfile } = useAuth();
  const router = useRouter();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalVenues: 0,
    approvedEvents: 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/events');
    }
  };

  // Fetch real data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch events and venues in parallel
        const [eventsResponse, venuesResponse] = await Promise.all([
          fetchEvents('APPROVED'),
          fetchVenues()
        ]);
        
        // Extract data arrays from responses
        const eventsData = Array.isArray(eventsResponse?.data) ? eventsResponse.data : 
                          Array.isArray(eventsResponse) ? eventsResponse : [];
        const venuesData = Array.isArray(venuesResponse?.data) ? venuesResponse.data : 
                          Array.isArray(venuesResponse) ? venuesResponse : [];
        
        console.log('📊 Loaded data:', { 
          events: eventsData.length, 
          venues: venuesData.length 
        });
        
        // Sort events by date and get featured ones (upcoming events)
        const now = new Date();
        const upcomingEvents = eventsData
          .filter((event: any) => new Date(event.startDate) > now)
          .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 6);
        
        setFeaturedEvents(upcomingEvents);
        setVenues(venuesData.slice(0, 4)); // Top 4 venues
        
        // Calculate real stats
        setStats({
          totalEvents: eventsData.length,
          totalVenues: venuesData.length,
          approvedEvents: eventsData.filter((e: any) => e.status === 'APPROVED').length
        });
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const categories = [
    { name: 'Music', icon: Music, color: 'hsl(var(--primary))', bgColor: 'hsl(var(--primary) / 0.1)' },
    { name: 'Sports', icon: Trophy, color: 'hsl(var(--secondary))', bgColor: 'hsl(var(--secondary) / 0.1)' },
    { name: 'Theater', icon: Theater, color: 'hsl(var(--accent))', bgColor: 'hsl(var(--accent) / 0.1)' },
    { name: 'Comedy', icon: Heart, color: 'hsl(var(--muted))', bgColor: 'hsl(var(--muted) / 0.1)' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your tickets are protected with industry-standard security',
      color: 'hsl(var(--primary))'
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Get your tickets immediately after purchase',
      color: 'hsl(var(--secondary))'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our team is here to help whenever you need assistance',
      color: 'hsl(var(--accent))'
    }
  ];

  // Dynamic stats display
  const statsDisplay = [
    {
      title: 'Approved Events',
      value: stats.approvedEvents.toString(),
      icon: <Calendar size={24} className="text-primary" />,
      description: 'Ready to book'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents.toString(),
      icon: <Ticket size={24} className="text-primary" />,
      description: 'In our platform'
    },
    {
      title: 'Available Venues',
      value: stats.totalVenues.toString(),
      icon: <MapPin size={24} className="text-primary" />,
      description: 'Across the region'
    },
    {
      title: 'Success Rate',
      value: '99.9%',
      icon: <TrendingUp size={24} className="text-primary" />,
      description: 'Event completion'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-muted"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-muted"></div>
      
      {/* Content Container */}
      <div className="relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Hero Section */}
          <section className="relative pt-24 pb-16">
            <div className="px-4 sm:px-6 lg:px-8">
              <motion.div variants={itemVariants} className="text-center mb-12">
                {/* User Welcome Message */}
                {userProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 backdrop-blur-xl border rounded-2xl shadow-xl mx-auto max-w-md bg-card border-border"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Activity className="h-6 w-6 text-primary" />
                      <p className="text-lg font-medium text-foreground">
                        Welcome back, {userProfile.firstName || 'User'}!
                      </p>
                    </div>
                  </motion.div>
                )}
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight"
                >
                  Your Gateway to{' '}
                  <span className="bg-gradient-to-r from-primary via-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Unforgettable
                  </span>
                  {' '}Experiences
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-lg md:text-xl mb-12 text-muted-foreground max-w-3xl mx-auto"
                >
                  Discover and book tickets for the best concerts, sports events, theater shows, and entertainment near you
                </motion.p>
                
                {/* Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="max-w-2xl mx-auto mb-12"
                >
                  <form onSubmit={handleSearch} className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl bg-card/50 border-border/50">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search for events, venues, or categories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground border-border placeholder:text-muted-foreground transition-all"
                        />
                      </div>
                      <Button 
                        type="submit"
                        size="lg" 
                        className="px-8 py-3 font-medium rounded-xl shadow-lg transition-all duration-200 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Search className="mr-2 h-5 w-5" />
                        Search
                      </Button>
                    </div>
                  </form>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button
                    size="lg"
                    asChild
                    className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 group bg-primary text-primary-foreground hover:shadow-xl hover:scale-105"
                  >
                    <Link href="/events" className="flex items-center justify-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>Browse Events</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 border-2 hover:scale-105 hover:bg-primary/5"
                  >
                    <Link href="/venues" className="flex items-center justify-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>Explore Venues</span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <motion.div variants={itemVariants} className="mb-16 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-md transition-all duration-200 bg-card border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1 text-foreground">{stat.title}</p>
                      <div className="text-3xl font-bold mb-1 text-primary">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className="rounded-lg p-3 ml-4 bg-primary/20">
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Categories Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Browse by Category</h2>
              <p className="text-lg text-muted-foreground">
                Find events that match your interests
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link key={index} href={`/events?category=${category.name.toLowerCase()}`}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      className="backdrop-blur-xl border rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group bg-card/50 border-border/50 cursor-pointer"
                    >
                      <div className="rounded-xl p-4 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: category.bgColor }}>
                        <Icon className="h-10 w-10" style={{ color: category.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-center text-foreground group-hover:text-primary transition-colors duration-200">
                        {category.name}
                      </h3>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          </section>

          {/* Featured Events */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xl text-muted-foreground">
                {loading ? 'Loading amazing events...' : 'Don\'t miss these exciting upcoming events'}
              </p>
            </motion.div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border animate-pulse">
                    <div className="h-48 bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : featuredEvents.length > 0 ? (
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-xl text-muted-foreground mb-4">No upcoming events at the moment</p>
                <p className="text-sm text-muted-foreground">Check back soon for exciting new events!</p>
              </motion.div>
            )}
            
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mt-12"
            >
              <Button
              size="lg"
              variant="outline"
              asChild
              className="px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 group border-primary text-primary bg-transparent hover:bg-primary/10"
              >
              <Link href="/events" className="flex items-center gap-2">
                <span className="transition-colors duration-200 group-hover:text-primary">View All Events</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
              </Button>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Why Choose NexTicket?</h2>
              <p className="text-xl text-muted-foreground">
                The best way to discover and book event tickets
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div 
                    key={index} 
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="text-center backdrop-blur-xl border rounded-2xl p-8 shadow-xl hover:shadow-md transition-all duration-200 bg-card border-border">
                    <div className="rounded-xl p-4 w-fit mx-auto mb-6" style={{ backgroundColor: feature.color + '20' }}>
                      <Icon className="h-8 w-8" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div 
              variants={itemVariants} 
              whileHover={{ scale: 1.01 }}
              className="backdrop-blur-xl border rounded-3xl p-12 md:p-16 shadow-2xl text-center relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border-border">
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-green-400 blur-3xl animate-pulse delay-700"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-10"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="rounded-2xl p-4 bg-primary/20 backdrop-blur-sm">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                    Ready to Create{' '}
                    <span className="bg-gradient-to-r from-primary via-green-400 to-emerald-500 bg-clip-text text-transparent">
                      Unforgettable Memories
                    </span>
                    ?
                  </h2>
                  <p className="text-lg md:text-xl mb-10 text-muted-foreground max-w-2xl mx-auto">
                    {userProfile 
                      ? `Welcome back, ${userProfile.firstName}! Discover your next amazing experience.`
                      : 'Join thousands of event-goers and start your journey today'}
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    size="lg" 
                    asChild
                    className="px-10 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 group hover:scale-105 hover:shadow-xl bg-primary text-primary-foreground">
                    <Link href="/events" className="flex items-center justify-center gap-2">
                      <Ticket className="h-5 w-5" />
                      <span>Browse Events</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  {!userProfile && (
                    <Button 
                      size="lg" 
                      variant="outline" 
                      asChild
                      className="px-10 py-6 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105 border-2 hover:bg-primary/5">
                      <Link href="/auth/signup" className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>Sign Up Free</span>
                      </Link>
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
