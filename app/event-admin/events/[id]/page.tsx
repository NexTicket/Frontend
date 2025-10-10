'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Settings,
  Save,
  ArrowLeft,
  Edit,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { fetchMyAssignedEvents, fetchCheckinOfficers, updateEventDetails } from '@/lib/api';

// Theme to match other admin pages
const darkBg = "#181A20";
const blueHeader = "#1877F2";
const cardBg = "#23262F";
const greenBorder = "#CBF83E" + '50';
const cardShadow = "0 2px 16px 0 rgba(57,253,72,0.08)";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: string;
  venue?: {
    id: number;
    name: string;
    location: string;
  };
  organizer?: {
    name: string;
    email: string;
  };
  checkinOfficerUids?: string[];
}

interface CheckinOfficer {
  uid: string;
  name: string;
  email: string;
}

export default function EventDetailPage() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [checkinOfficers, setCheckinOfficers] = useState<CheckinOfficer[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<CheckinOfficer[]>([]);
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [loadingOfficers, setLoadingOfficers] = useState(false);

  // Mock checkin officers data (fallback)
  const mockOfficers: CheckinOfficer[] = [
    { uid: 'officer1', name: 'John Doe', email: 'john@nexticket.com' },
    { uid: 'officer2', name: 'Jane Smith', email: 'jane@nexticket.com' },
    { uid: 'officer3', name: 'Mike Johnson', email: 'mike@nexticket.com' },
  ];

  useEffect(() => {
    const loadEvent = async () => {
      if (!userProfile || !eventId) return;
      
      setLoading(true);
      try {
        const response = await fetchMyAssignedEvents();
        const events = response?.data || response || [];
        const foundEvent = events.find((e: Event) => e.id.toString() === eventId);
        
        if (foundEvent) {
          setEvent(foundEvent);
          setEditedEvent(foundEvent);
        }
      } catch (error) {
        console.error('❌ Failed to load event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [userProfile, eventId]);

  // Separate effect for loading officers when event changes
  useEffect(() => {
    if (!event) return;
    
    const loadCheckinOfficers = async () => {
      setLoadingOfficers(true);
      try {
        const response = await fetchCheckinOfficers();
        const officers = response?.data || response || [];
        const formattedOfficers: CheckinOfficer[] = officers.map((officer: any) => ({
          uid: officer.uid,
          name: officer.displayName || `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || officer.email,
          email: officer.email
        }));
        
        // Filter out already assigned officers
        const assignedUids = event?.checkinOfficerUids || [];
        const available = formattedOfficers.filter(officer => 
          !assignedUids.includes(officer.uid)
        );
        setAvailableOfficers(available);
        
        // Set assigned officers
        const assigned = formattedOfficers.filter(officer => 
          assignedUids.includes(officer.uid)
        );
        setCheckinOfficers(assigned);
        
      } catch (error) {
        console.error('❌ Failed to load checkin officers:', error);
        // Fallback to mock data if API fails
        const mockOfficers: CheckinOfficer[] = [
          { uid: 'officer1', name: 'John Doe', email: 'john@nexticket.com' },
          { uid: 'officer2', name: 'Jane Smith', email: 'jane@nexticket.com' },
          { uid: 'officer3', name: 'Mike Johnson', email: 'mike@nexticket.com' },
        ];
        
        const assignedUids = event?.checkinOfficerUids || [];
        const available = mockOfficers.filter(officer => 
          !assignedUids.includes(officer.uid)
        );
        setAvailableOfficers(available);
        
        const assigned = mockOfficers.filter(officer => 
          assignedUids.includes(officer.uid)
        );
        setCheckinOfficers(assigned);
      } finally {
        setLoadingOfficers(false);
      }
    };

    loadCheckinOfficers();
  }, [event]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
  }, [isLoading, firebaseUser, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkBg }}>
        <div className="text-lg" style={{ color: '#fff' }}>Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkBg }}>
        <div className="text-center">
          <div className="text-lg mb-4" style={{ color: '#fff' }}>Event Not Found</div>
          <p style={{ color: '#ABA8A9' }}>The event you're looking for doesn't exist.</p>
          <Button 
            onClick={() => router.push('/event-admin')}
            className="mt-4"
            style={{ background: '#0D6EFD' }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editedEvent) return;
    
    setSaving(true);
    try {
      console.log('💾 Saving event:', editedEvent);
      
      const updateData = {
        title: editedEvent.title,
        description: editedEvent.description,
        startDate: editedEvent.startDate,
        endDate: editedEvent.endDate,
        startTime: editedEvent.startTime,
        endTime: editedEvent.endTime,
        capacity: editedEvent.capacity,
        checkinOfficerUids: editedEvent.checkinOfficerUids
      };
      
      const response = await updateEventDetails(eventId as string, updateData);
      console.log('✅ Event saved successfully:', response);
      
      setEvent(editedEvent);
      setEditing(false);
    } catch (error) {
      console.error('❌ Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Event, value: any) => {
    if (!editedEvent) return;
    setEditedEvent({
      ...editedEvent,
      [field]: value
    });
  };

  const addCheckinOfficer = (officer: CheckinOfficer) => {
    setCheckinOfficers([...checkinOfficers, officer]);
    setAvailableOfficers(availableOfficers.filter(o => o.uid !== officer.uid));
    
    // Update edited event
    if (editedEvent) {
      const newUids = [...(editedEvent.checkinOfficerUids || []), officer.uid];
      setEditedEvent({
        ...editedEvent,
        checkinOfficerUids: newUids
      });
    }
  };

  const removeCheckinOfficer = (officer: CheckinOfficer) => {
    setCheckinOfficers(checkinOfficers.filter(o => o.uid !== officer.uid));
    setAvailableOfficers([...availableOfficers, officer]);
    
    // Update edited event
    if (editedEvent) {
      const newUids = (editedEvent.checkinOfficerUids || []).filter(uid => uid !== officer.uid);
      setEditedEvent({
        ...editedEvent,
        checkinOfficerUids: newUids
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  return (
    <div className="min-h-screen" style={{ background: darkBg }}>
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: blueHeader, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => router.push('/event-admin')}
                  variant="outline"
                  size="sm"
                  style={{ borderColor: '#CBF83E', color: '#CBF83E', backgroundColor: 'transparent' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>
                    {editing ? 'Edit Event' : 'Event Details'}
                  </h1>
                  <p className="text-lg" style={{ color: '#fff' }}>{event.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {!editing ? (
                  <Button 
                    onClick={() => setEditing(true)}
                    style={{ background: '#CBF83E', color: '#000' }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        setEditing(false);
                        setEditedEvent(event);
                      }}
                      variant="outline"
                      style={{ borderColor: '#CBF83E', color: '#CBF83E', backgroundColor: 'transparent' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      style={{ background: '#CBF83E', color: '#000' }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
              style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: '#fff' }}>
                <Settings className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
                    Event Title
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedEvent?.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#1f222a', 
                        borderColor: greenBorder, 
                        color: '#fff'
                      }}
                    />
                  ) : (
                    <p className="text-lg font-medium" style={{ color: '#fff' }}>{event.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
                    Description
                  </label>
                  {editing ? (
                    <textarea
                      value={editedEvent?.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        backgroundColor: '#1f222a', 
                        borderColor: greenBorder, 
                        color: '#fff'
                      }}
                    />
                  ) : (
                    <p style={{ color: '#fff' }}>{event.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
                      Start Date
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        value={editedEvent?.startDate?.split('T')[0] || ''}
                        onChange={(e) => handleInputChange('startDate', e.target.value + 'T00:00:00.000Z')}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: '#1f222a', 
                          borderColor: greenBorder, 
                          color: '#fff'
                        }}
                      />
                    ) : (
                      <p style={{ color: '#fff' }}>{formatDate(event.startDate)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ABA8A9' }}>
                      Capacity
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        value={editedEvent?.capacity || ''}
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          backgroundColor: '#1f222a', 
                          borderColor: greenBorder, 
                          color: '#fff'
                        }}
                      />
                    ) : (
                      <p style={{ color: '#fff' }}>{event.capacity} attendees</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Venue Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
              style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: '#fff' }}>
                <MapPin className="w-5 h-5 mr-2" />
                Venue Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                  <MapPin className="w-4 h-4 mr-2" style={{ color: '#fff' }} />
                  <span>{event.venue?.name || 'Venue TBD'}</span>
                </div>
                <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                  <Calendar className="w-4 h-4 mr-2" style={{ color: '#fff' }} />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                  <Clock className="w-4 h-4 mr-2" style={{ color: '#fff' }} />
                  <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Team Management */}
          <div className="space-y-6">
            {/* Checkin Officers */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
              style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center" style={{ color: '#fff' }}>
                  <Users className="w-5 h-5 mr-2" />
                  Checkin Officers
                </h3>
                <Button 
                  onClick={() => setShowAddOfficer(!showAddOfficer)}
                  size="sm"
                  style={{ background: '#CBF83E', color: '#000' }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Add Officer Section */}
              {showAddOfficer && (
                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#1f222a' }}>
                  <h4 className="text-sm font-medium mb-3" style={{ color: '#fff' }}>Available Officers</h4>
                  {loadingOfficers ? (
                    <div className="text-center py-4" style={{ color: '#ABA8A9' }}>
                      Loading officers...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableOfficers.length === 0 ? (
                        <p className="text-center py-2" style={{ color: '#ABA8A9' }}>
                          No available officers found
                        </p>
                      ) : (
                        availableOfficers.map((officer) => (
                          <div key={officer.uid} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: cardBg }}>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#fff' }}>{officer.name}</p>
                              <p className="text-xs" style={{ color: '#ABA8A9' }}>{officer.email}</p>
                            </div>
                            <Button 
                              onClick={() => addCheckinOfficer(officer)}
                              size="sm"
                              style={{ background: '#0D6EFD', color: '#fff' }}
                            >
                              <UserPlus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Officers */}
              <div className="space-y-3">
                {checkinOfficers.length === 0 ? (
                  <p className="text-center py-4" style={{ color: '#ABA8A9' }}>
                    No checkin officers assigned
                  </p>
                ) : (
                  checkinOfficers.map((officer) => (
                    <div key={officer.uid} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#1f222a' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#CBF83E' }}>
                          <span className="text-sm font-medium text-black">
                            {officer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#fff' }}>{officer.name}</p>
                          <p className="text-xs" style={{ color: '#ABA8A9' }}>{officer.email}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => removeCheckinOfficer(officer)}
                        size="sm"
                        variant="outline"
                        style={{ borderColor: '#ff6b35', color: '#ff6b35', backgroundColor: 'transparent' }}
                      >
                        <UserMinus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Event Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
              style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center" style={{ color: '#fff' }}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Event Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#ABA8A9' }}>Status</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#ABA8A9' }}>Checkin Officers</span>
                  <span style={{ color: '#fff' }}>{checkinOfficers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#ABA8A9' }}>Capacity</span>
                  <span style={{ color: '#fff' }}>{event.capacity}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
