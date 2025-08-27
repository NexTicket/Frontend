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
      whileHover={{ scale: 1.02, y: -5 }}
      className={`backdrop-blur-xl border rounded-2xl overflow-hidden shadow-xl hover:shadow-md transition-all duration-200 ${className}`}
      style={{ 
        backgroundColor: '#191C24', 
        borderColor: '#0D6EFD' + '30',
        boxShadow: '0 25px 50px -12px rgba(74, 144, 226, 0.1)' 
      }}
    >
      <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: '#191C24', borderBottom: '1px solid #0D6EFD30' }}>
        <Calendar className="h-12 w-12" style={{ color: '#0D6EFD' }} />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 text-sm rounded-full font-medium" style={{ backgroundColor: '#CBF83E20', color: '#CBF83E' }}>
            {event.category}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1" style={{ color: '#FFD60A' }} />
            <span className="text-sm" style={{ color: '#ABA8A9' }}>4.8</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3" style={{ color: '#fff' }}>{event.title}</h3>
        
        <div className="space-y-2 text-sm mb-4" style={{ color: '#ABA8A9' }}>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
            {event.venue}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
            {event.availableTickets} tickets available
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold" style={{ color: '#CBF83E' }}>
            ${event.price}
          </span>
          <Button 
            asChild
            className="px-6 py-2 text-white font-medium rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: '#0D6EFD' }}
          >
            <Link href={`/events/${event.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
