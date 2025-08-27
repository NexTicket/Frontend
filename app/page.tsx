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
    { name: 'Music', icon: Music, color: '#CBF83E', bgColor: '#CBF83E20' },
    { name: 'Sports', icon: Trophy, color: '#0D6EFD', bgColor: '#0D6EFD20' },
    { name: 'Theater', icon: Theater, color: '#39FD48', bgColor: '#39FD4820' },
    { name: 'Comedy', icon: Heart, color: '#FFD60A', bgColor: '#FFD60A20' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your tickets are protected with industry-standard security',
      color: '#CBF83E'
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      description: 'Get your tickets immediately after purchase',
      color: '#0D6EFD'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our team is here to help whenever you need assistance',
      color: '#39FD48'
    }
  ];

  const stats = [
    {
      title: 'Happy Customers',
      value: '10K+',
      icon: <Users size={24} style={{ color: '#CBF83E' }} />,
      description: 'Satisfied users'
    },
    {
      title: 'Events Hosted',
      value: '500+',
      icon: <Calendar size={24} style={{ color: '#CBF83E' }} />,
      description: 'Successfully organized'
    },
    {
      title: 'Revenue Generated',
      value: 'LKR 2M+',
      icon: <DollarSign size={24} style={{ color: '#CBF83E' }} />,
      description: 'For our partners'
    },
    {
      title: 'Success Rate',
      value: '99.9%',
      icon: <TrendingUp size={24} style={{ color: '#CBF83E' }} />,
      description: 'Event completion'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: '#191C24' }}>
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#ABA8A9' }}></div>
      
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
                    className="mb-8 p-6 backdrop-blur-xl border rounded-2xl shadow-xl mx-auto max-w-md" 
                    style={{ 
                      backgroundColor: '#191C24', 
                      borderColor: '#39FD48' + '50',
                      boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' 
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Activity className="h-6 w-6" style={{ color: '#CBF83E' }} />
                      <p className="text-lg font-medium" style={{ color: '#fff' }}>
                        Welcome back, {userProfile.firstName || 'User'}!
                      </p>
                    </div>
                  </motion.div>
                )}
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8"
                  style={{ color: '#fff' }}
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
                  <div className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl" 
                    style={{ 
                      backgroundColor: '#191C24', 
                      borderColor: '#0D6EFD' + '30',
                      boxShadow: '0 25px 50px -12px rgba(74, 144, 226, 0.1)' 
                    }}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#ABA8A9' }} />
                        <input
                          type="text"
                          placeholder="Search events, artists, venues..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ 
                            backgroundColor: '#191C24', 
                            color: '#fff',
                            border: '1px solid #39FD48' + '30'
                          }}
                        />
                      </div>
                      <Button 
                        size="lg" 
                        className="px-8 py-3 text-white font-medium rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-90"
                        style={{ background: '#0D6EFD' }}
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
                    className="px-8 py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200 group"
                    style={{
                      background: '#0D6EFD',
                      color: '#FFFFFF'
                    }}
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
                  className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-md transition-all duration-200"
                  style={{ 
                    backgroundColor: '#191C24', 
                    borderColor: '#39FD48' + '50',
                    boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' 
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1" style={{ color: '#fff' }}>{stat.title}</p>
                      <div className="text-3xl font-bold mb-1" style={{ color: '#ABA8A9' }}>{stat.value}</div>
                      <p className="text-xs" style={{ color: '#ABA8A9' }}>{stat.description}</p>
                    </div>
                    <div className="rounded-lg p-3 ml-4" style={{ backgroundColor: '#D8DFEE' + '40' }}>
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
                    className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-md transition-all duration-200 group"
                    style={{ 
                      backgroundColor: '#191C24', 
                      borderColor: category.color + '30',
                      boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' 
                    }}
                  >
                    <Link href={`/events?category=${category.name.toLowerCase()}`}>
                      <div className="rounded-xl p-4 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: category.bgColor }}>
                        <Icon className="h-8 w-8" style={{ color: category.color }} />
                      </div>
                      <h3 className="text-lg font-semibold text-center" style={{ color: '#fff' }}>{category.name}</h3>
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
            
            <motion.div variants={itemVariants} className="text-center mt-12">
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#39FD48',
                  color: '#39FD48',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#39FD48' + '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Link href="/events">
                  View All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#fff' }}>Why Choose NexTicket?</h2>
              <p className="text-xl" style={{ color: '#ABA8A9' }}>
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
                    className="text-center backdrop-blur-xl border rounded-2xl p-8 shadow-xl hover:shadow-md transition-all duration-200"
                    style={{ 
                      backgroundColor: '#191C24', 
                      borderColor: feature.color + '30',
                      boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' 
                    }}
                  >
                    <div className="rounded-xl p-4 w-fit mx-auto mb-6" style={{ backgroundColor: feature.color + '20' }}>
                      <Icon className="h-8 w-8" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#fff' }}>{feature.title}</h3>
                    <p style={{ color: '#ABA8A9' }}>{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="backdrop-blur-xl border rounded-3xl p-12 shadow-xl text-center" style={{ backgroundColor: '#0D6EFD', borderColor: '#CBF83E' }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#fff' }}>
                Ready to Find Your Next Event?
              </h2>
              <p className="text-xl mb-8" style={{ color: '#fff', opacity: 0.9 }}>
                Join thousands of event-goers who trust NexTicket for their entertainment needs
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:opacity-90 transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, #CBF83E, #39FD48)',
                    color: '#191C24'
                  }}
                >
                  <Link href="/events">
                    Start Exploring
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#fff',
                    color: '#fff',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff' + '10';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Link href="/auth/signup">
                    Create Account
                  </Link>
                </Button>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
