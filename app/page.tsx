"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/ui/event-card';
import { useAuth } from '@/components/auth/auth-provider';
import { motion } from 'framer-motion';
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
  Clock,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

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
  
  const featuredEvents = mockEvents.slice(0, 6);
  
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

  const stats = [
    {
      title: 'Happy Customers',
      value: '10K+',
      icon: <Users size={24} className="text-primary" />,
      description: 'Satisfied users'
    },
    {
      title: 'Events Hosted',
      value: '500+',
      icon: <Calendar size={24} className="text-primary" />,
      description: 'Successfully organized'
    },
    {
      title: 'Revenue Generated',
      value: 'LKR 2M+',
      icon: <DollarSign size={24} className="text-primary" />,
      description: 'For our partners'
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
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-foreground"
                >
                  Discover Amazing{' '}
                  <span style={{ 
                    background: 'linear-gradient(135deg, #CBF83E, #39FD48)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Events
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-xl md:text-2xl mb-12"
                  style={{ color: '#ABA8A9' }}
                >
                  Find and book tickets for concerts, sports, theater, and more
                </motion.p>
                
                {/* Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="max-w-2xl mx-auto mb-12"
                >
                  <div className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl bg-card border-border">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#ABA8A9' }} />
                        <input
                          type="text"
                          placeholder="Search events, artists, venues..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground border-border placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button 
                        size="lg" 
                        className="px-8 py-3 font-medium rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-90 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Search className="mr-2 h-5 w-5" />
                        Search Events
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center"
                >
                  <Button
                    size="lg"
                    asChild
                    className="px-8 py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200 group bg-primary text-primary-foreground"
                  >
                    <Link href="/events" className="flex items-center justify-center gap-2">
                      <span>Browse All Events</span>
                      <ArrowRight
                        className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </Button>
                    <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 border-[#0D6EFD] text-[#0D6EFD] hover:bg-[#0D6EFD]/10 hover:scale-105 hover:text-[#0D6EFD]"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                    >
                    <Link href="/venues">
                      Explore Venues
                    </Link>
                    </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <motion.div variants={itemVariants} className="mb-16 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
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
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#fff' }}>Popular Categories</h2>
              <p className="text-xl" style={{ color: '#ABA8A9' }}>
                Discover events by category
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-md transition-all duration-200 group bg-card border-border">
                    <Link href={`/events?category=${category.name.toLowerCase()}`}>
                      <div className="rounded-xl p-4 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: category.bgColor }}>
                        <Icon className="h-8 w-8" style={{ color: category.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-center text-foreground">{category.name}</h3>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* Featured Events */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#fff' }}>Featured Events</h2>
              <p className="text-xl" style={{ color: '#ABA8A9' }}>
                Don't miss these amazing upcoming events
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </motion.div>
            
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
              whileHover={{ scale: 1.01, y: -2 }}
              className="backdrop-blur-xl border rounded-3xl p-12 shadow-xl text-center relative overflow-hidden bg-card border-border">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 opacity-5 rounded-3xl bg-gradient-to-br from-primary to-secondary"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="rounded-xl p-3 bg-primary/20">
                      <ArrowRight className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                    Ready to Find Your Next{' '}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Adventure
                    </span>
                    ?
                  </h2>
                  <p className="text-xl mb-8 text-muted-foreground">
                    Join thousands of event-goers who trust NexTicket for their entertainment needs
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center"
                >
                  <Button 
                    size="lg" 
                    asChild
                    className="px-8 py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200 group hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/events" className="flex items-center justify-center gap-2">
                      <span>Start Exploring</span>
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    asChild
                    className="px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105 group border-primary text-primary bg-transparent hover:bg-primary/10 hover:text-primary">
                    <Link href="/auth/signup" className="flex items-center gap-2">
                      <span>Create Account</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
