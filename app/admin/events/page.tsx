'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEvents } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  Filter,
  Search,
  Eye,
  Check,
  X,
  UserPlus,
  Shield,
  ChevronDown,
  AlertCircle,
  Calendar as CalendarIcon,
  DollarSign,
  Ticket,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function AdminEvents() {
  const router = useRouter();
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const loadPendingEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await fetchEvents('PENDING');
        const events = response?.data || response || [];
        setPendingEvents(events);
      } catch (error) {
        console.error('Failed to load pending events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    loadPendingEvents();
  }, []);

  const handleReviewEvent = (eventId: number) => {
    router.push(`/admin/events/review/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Events</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve event submissions from organizers
          </p>
        </div>

        <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Pending Event Approvals</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{pendingEvents.length} Pending</span>
            </div>
          </div>

          {loadingEvents ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Loading Events...</h3>
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Events</h3>
              <p className="text-muted-foreground mb-4">All events have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border p-6 bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate mb-3">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                          {event.category}
                        </span>
                        <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1">
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        {event.venue && (
                          <span className="text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1">
                            {event.venue.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <Button
                        onClick={() => handleReviewEvent(event.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review Event
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}