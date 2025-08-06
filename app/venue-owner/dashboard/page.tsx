'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Star,
  Activity
} from 'lucide-react';

// Mock data for now - replace with actual API calls
const mockVenueOwnerData = {
  venues: [
    {
      id: '1',
      name: 'Grand Theater',
      location: 'Downtown',
      capacity: 500,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?w=400&h=300&fit=crop',
      status: 'active',
      totalEvents: 12,
      monthlyRevenue: 25000,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Conference Center',
      location: 'Business District',
      capacity: 200,
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
      status: 'active',
      totalEvents: 8,
      monthlyRevenue: 15000,
      rating: 4.6
    }
  ],
  stats: {
    totalVenues: 2,
    totalEvents: 20,
    monthlyRevenue: 40000,
    occupancyRate: 85
  },
  recentActivity: [
    { id: 1, type: 'booking', message: 'New event booked at Grand Theater', time: '2 hours ago' },
    { id: 2, type: 'review', message: 'New 5-star review for Conference Center', time: '5 hours ago' },
    { id: 3, type: 'payment', message: 'Payment received for Grand Theater event', time: '1 day ago' }
  ]
};

export default function VenueOwnerDashboard() {
  const [venues, setVenues] = useState(mockVenueOwnerData.venues);
  const [stats, setStats] = useState(mockVenueOwnerData.stats);
  const [recentActivity, setRecentActivity] = useState(mockVenueOwnerData.recentActivity);
  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  return (
    <div className="p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Venue Owner Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Manage your venues and track performance</p>
            </div>
            <Link href="/venue-owner/venues/new">
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Create New Venue
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Venues</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalVenues}</p>
              </div>
              <Building2 className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-green-700">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-700">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Occupancy Rate</p>
                <p className="text-3xl font-bold text-orange-700">{stats.occupancyRate}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Venues */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">My Venues</h2>
                <Link href="/venue-owner/venues">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {venues.map((venue, index) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-background/50 rounded-lg p-4 border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{venue.name}</h3>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{venue.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {venue.location}
                          <Users className="h-4 w-4 ml-4 mr-1" />
                          {venue.capacity} capacity
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600 font-medium">
                              {venue.totalEvents} events
                            </span>
                            <span className="text-blue-600 font-medium">
                              ${venue.monthlyRevenue.toLocaleString()}/mo
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link href={`/venues/${venue.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/venue-owner/venues/${venue.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
              <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
