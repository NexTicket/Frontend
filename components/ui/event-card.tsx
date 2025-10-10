"use client"

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star
} from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    venue: string;
    availableTickets: number;
    price: number;
    category: string;
  };
  className?: string;
}

export function EventCard({ event, className = "" }: EventCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.03, 
        y: -8,
        boxShadow: '0 32px 64px -12px rgba(74, 144, 226, 0.25)',
        borderColor: 'hsl(var(--primary) / 0.6)'
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={`backdrop-blur-xl border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ease-out bg-card border-primary/30 ${className}`}
    >
      <motion.div 
        className="aspect-video flex items-center justify-center bg-card border-b border-primary/30" 
        whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Calendar className="h-12 w-12 text-primary" />
        </motion.div>
      </motion.div>
      
      <div className="p-6">
        <motion.div 
          className="flex items-center justify-between mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span className="px-3 py-1 text-sm rounded-full font-medium bg-primary/20 text-primary">
            {event.category}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            <span className="text-sm text-muted-foreground">4.8</span>
          </div>
        </motion.div>
        
        <motion.h3 
          className="text-xl font-semibold mb-3" 
          style={{ color: '#fff' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {event.title}
        </motion.h3>
        
        <motion.h3 
          className="text-xl font-bold mb-3 text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {event.title}
        </motion.h3>
        
        <motion.div 
          className="space-y-2 text-sm mb-4 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            {event.venue}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            {event.availableTickets} tickets available
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <span className="text-2xl font-bold text-green-500">
            LKR {event.price}
          </span>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              asChild
              className="px-6 py-2 text-white font-medium rounded-xl shadow-lg hover:opacity-90 transition-opacity duration-200 bg-primary"
            >
              <Link href={`/events/${event.id}`}>
                View Details
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
