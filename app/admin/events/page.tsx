'use client';

import React, { useState, useEffect } from 'react';
import { fetchEvents, approveEvent, rejectEvent, fetchFirebaseUsers } from '@/lib/api';
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
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventAdmins, setEventAdmins] = useState<any[]>([]);
  const [checkinOfficers, setCheckinOfficers] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedEventAdmin, setSelectedEventAdmin] = useState<string>('');
  const [selectedCheckinOfficers, setSelectedCheckinOfficers] = useState<string[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

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
    
    const loadStaff = async () => {
      try {
        // Fetch event admins
        const eventAdminResponse = await fetchFirebaseUsers('event_admin');
        const admins = eventAdminResponse?.data || [];
        console.log('📥 Loaded event admins:', admins.length);
        setEventAdmins(admins);
        
        // Fetch checkin officers
        const checkinOfficerResponse = await fetchFirebaseUsers('checkin_officer');
        const officers = checkinOfficerResponse?.data || [];
        console.log('📥 Loaded checkin officers:', officers.length);
        
        // Check for duplicate UIDs
        const uids = officers.map((o: any) => o.uid);
        const uniqueUids = [...new Set(uids)];
        if (uids.length !== uniqueUids.length) {
          console.warn('⚠️ Duplicate UIDs found in checkin officers!', {
            total: uids.length,
            unique: uniqueUids.length
          });
        }
        
        // Remove duplicates if any
        const uniqueOfficers = officers.filter((officer: any, index: number, self: any[]) => 
          index === self.findIndex((o: any) => o.uid === officer.uid)
        );
        
        setCheckinOfficers(uniqueOfficers);
        console.log('✅ Set unique checkin officers:', uniqueOfficers.length);
      } catch (error) {
        console.error('Failed to load staff:', error);
      }
    };
    
    loadPendingEvents();
    loadStaff();
  }, []);

  const handleApproveEvent = async (event: any) => {
    console.log('📋 Opening approval modal for event:', event.title);
    setSelectedEvent(event);
    setSelectedEventAdmin('');
    setSelectedCheckinOfficers([]); // Reset to empty array
    setShowApprovalModal(true);
    console.log('✅ Modal state reset - checkinOfficers:', []);
  };

  const confirmApproval = async () => {
    if (!selectedEvent) return;
    
    console.log('🚀 Confirming approval with data:', {
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      venueId: selectedEvent.venueId,
      eventAdminUid: selectedEventAdmin || undefined,
      checkinOfficerUids: selectedCheckinOfficers,
      selectedCount: selectedCheckinOfficers.length
    });
    
    try {
      await approveEvent(selectedEvent.id, {
        venueId: selectedEvent.venueId,
        eventAdminUid: selectedEventAdmin || undefined,
        checkinOfficerUids: selectedCheckinOfficers
      });
      
      console.log('✅ Event approved successfully');
      
      // Refresh pending events
      const response = await fetchEvents('PENDING');
      const events = response?.data || response || [];
      setPendingEvents(events);
      
      setShowApprovalModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('❌ Failed to approve event:', error);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      await rejectEvent(eventId);
      // Refresh pending events
      const response = await fetchEvents('PENDING');
      const events = response?.data || response || [];
      setPendingEvents(events);
    } catch (error) {
      console.error('Failed to reject event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Manage Events</h1>
        <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card border-border">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Pending Event Approvals</h2>
          {loadingEvents ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Loading Events...</h3>
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Events</h3>
              <p className="text-muted-foreground mb-4">All events have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingEvents.map(event => (
                <div key={event.id} className="rounded-2xl border p-6 bg-card shadow-md flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="block text-lg font-semibold text-foreground truncate">{event.title}</div>
                    <p className="text-sm text-muted-foreground truncate">{event.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1">{event.category}</span>
                      <span className="text-xs rounded-full bg-secondary/10 text-secondary px-3 py-1">{event.startDate}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
                    <Button variant="outline" className="flex items-center border-primary text-foreground hover:bg-primary/10" onClick={() => handleApproveEvent(event)}>
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" className="flex items-center border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleRejectEvent(event.id)}>
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Staff Assignment Modal */}
      {showApprovalModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Assign Staff to Event</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">{selectedEvent.title}</h4>
                <p className="text-muted-foreground text-sm">{selectedEvent.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assign Event Admin</label>
                <select 
                  value={selectedEventAdmin} 
                  onChange={(e) => setSelectedEventAdmin(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-background border-gray-600 text-foreground"
                >
                  <option value="">Select Event Admin (Optional)</option>
                  {eventAdmins.map(admin => (
                    <option key={admin.uid} value={admin.uid}>
                      {admin.displayName || admin.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Assign Checkin Officers</label>
                  <span className="text-xs text-foreground">
                    {selectedCheckinOfficers.length} selected
                  </span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {checkinOfficers.map(officer => {
                    const isSelected = selectedCheckinOfficers.includes(officer.uid);
                    return (
                      <div key={officer.uid} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`officer-${officer.uid}`}
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            console.log(`🔄 Checkbox changed for ${officer.displayName || officer.email}:`, e.target.checked);
                            console.log('Current selected officers:', selectedCheckinOfficers);
                            
                            const newSelectedOfficers = e.target.checked
                              ? [...selectedCheckinOfficers, officer.uid]
                              : selectedCheckinOfficers.filter(uid => uid !== officer.uid);
                            
                            console.log('New selected officers:', newSelectedOfficers);
                            setSelectedCheckinOfficers(newSelectedOfficers);
                          }}
                          className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                        />
                        <label 
                          htmlFor={`officer-${officer.uid}`}
                          className="text-foreground text-sm cursor-pointer"
                        >
                          {officer.displayName || officer.email}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={confirmApproval}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Event
                </Button>
                <Button 
                  onClick={() => setShowApprovalModal(false)}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-muted/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}