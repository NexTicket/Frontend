'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loading } from '@/components/ui/loading';
import { 
  QrCode,
  Users, 
  CheckCircle2,
  Search,
  Eye,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  RefreshCw,
  Download,
  Scan,
  User,
  Clock4,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchMyCheckinEvents } from '@/lib/api';
import RouteGuard from '@/components/auth/routeGuard';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
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

interface AssignedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: 'pending' | 'active' | 'completed';
  totalTickets: number;
  checkedIn: number;
  myCheckins: number;
  organizer: string;
}

interface CheckinRecord {
  id: string;
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  checkedInAt: string;
  eventId: string;
  eventTitle: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketId: string;
  ticketType: string;
  status: 'pending' | 'checked_in';
  checkedInAt?: string;
}

const mockAssignedEvents: AssignedEvent[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: '2024-12-15',
    time: '09:00',
    venue: 'Convention Center Hall A',
    status: 'pending',
    totalTickets: 500,
    checkedIn: 0,
    myCheckins: 0,
    organizer: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    date: '2024-07-20',
    time: '18:00',
    venue: 'Central Park Amphitheater',
    status: 'active',
    totalTickets: 2000,
    checkedIn: 1250,
    myCheckins: 450,
    organizer: 'Mike Chen'
  },
  {
    id: '3',
    title: 'Food & Wine Expo',
    date: '2024-06-08',
    time: '11:00',
    venue: 'Downtown Exhibition Center',
    status: 'completed',
    totalTickets: 300,
    checkedIn: 280,
    myCheckins: 280,
    organizer: 'Emma Davis'
  }
];

const mockRecentCheckins: CheckinRecord[] = [
  {
    id: '1',
    ticketId: 'TIK-2024-001',
    attendeeName: 'John Smith',
    attendeeEmail: 'john@email.com',
    ticketType: 'VIP',
    checkedInAt: '2024-07-20T14:30:00Z',
    eventId: '2',
    eventTitle: 'Summer Music Festival'
  },
  {
    id: '2',
    ticketId: 'TIK-2024-002',
    attendeeName: 'Sarah Johnson',
    attendeeEmail: 'sarah@email.com',
    ticketType: 'General',
    checkedInAt: '2024-07-20T14:25:00Z',
    eventId: '2',
    eventTitle: 'Summer Music Festival'
  },
  {
    id: '3',
    ticketId: 'TIK-2024-003',
    attendeeName: 'Mike Wilson',
    attendeeEmail: 'mike@email.com',
    ticketType: 'Early Bird',
    checkedInAt: '2024-07-20T14:20:00Z',
    eventId: '2',
    eventTitle: 'Summer Music Festival'
  }
];

const mockAttendees: Attendee[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@email.com',
    ticketId: 'TIK-2024-001',
    ticketType: 'VIP',
    status: 'checked_in',
    checkedInAt: '2024-07-20T14:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@email.com',
    ticketId: 'TIK-2024-002',
    ticketType: 'General',
    status: 'checked_in',
    checkedInAt: '2024-07-20T14:25:00Z'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@email.com',
    ticketId: 'TIK-2024-003',
    ticketType: 'Early Bird',
    status: 'pending'
  }
];

export default function CheckinOfficerDashboard() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'checkin' | 'attendees'>('overview');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [assignedEvents, setAssignedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch assigned events for checkin officer
  useEffect(() => {
    const loadAssignedEvents = async () => {
      if (!userProfile || userProfile.role !== 'checkin_officer') return;
      
      setLoading(true);
      try {
        console.log('🎯 Fetching assigned events for checkin officer:', userProfile.uid);
        const response = await fetchMyCheckinEvents();
        const events = response?.data || response || [];
        setAssignedEvents(events);
        console.log('📊 Loaded assigned events:', events);
        
        // Set default selected event to the first active event
        const activeEvent = events.find((e: any) => {
          const eventDate = new Date(e.startDate);
          const now = new Date();
          return eventDate.toDateString() === now.toDateString();
        });
        if (activeEvent) {
          setSelectedEvent(activeEvent.id.toString());
        } else if (events.length > 0) {
          setSelectedEvent(events[0].id.toString());
        }
      } catch (error) {
        console.error('❌ Failed to load assigned events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedEvents();
  }, [userProfile]);

  // Calculate stats from real data
  const totalEvents = assignedEvents.length;
  const activeEvents = assignedEvents.filter(e => {
    const eventDate = new Date(e.startDate);
    const now = new Date();
    return eventDate.toDateString() === now.toDateString();
  }).length;
  const completedEvents = assignedEvents.filter(e => {
    const eventDate = new Date(e.startDate);
    const now = new Date();
    return eventDate < now;
  }).length;

  // Get event status
  const getEventStatus = (event: any) => {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    
    if (eventDate.toDateString() === now.toDateString()) {
      return 'active';
    } else if (eventDate > now) {
      return 'pending';
    } else {
      return 'completed';
    }
  };

  // Format date and time
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  // Helper to open the scanner modal
  const openScannerModal = () => {
    setScannerModalOpen(true);
    setCameraError(null);
    // Show warning and try to access camera
    setTimeout(() => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            setCameraStream(stream);
            setCameraError(null);
          })
          .catch(err => {
            setCameraError('Unable to access camera. Please allow camera permission and ensure a camera is connected.');
          });
      } else {
        setCameraError('Camera access is not supported in this browser.');
      }
    }, 300); // slight delay to allow modal to render
  };

  // Stop camera when modal closes
  useEffect(() => {
    if (!scannerModalOpen && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [scannerModalOpen, cameraStream]);

  // Open check-in page in a detached new tab to avoid opener-controlled redirects
  const openCheckin = (eventId: string) => {
    if (typeof window === 'undefined') return;
    const targetPath = `/checkin/${eventId}`;
    const fullUrl = `${window.location.origin}${targetPath}?detached=1`;

    // Open an about:blank window and write a small intermediate document that
    // immediately navigates to the real URL from inside the new tab.
    // This helps prevent the opener or cross-tab listeners from later controlling it.
    const newWin = window.open('about:blank', '_blank', 'noopener,noreferrer');
    if (!newWin) return;
    try {
      // extra safety: detach opener
      newWin.opener = null;

      const html = `<!doctype html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${fullUrl}">
            <meta name="referrer" content="no-referrer">
            <title>Opening Check-in</title>
            <script>
              // attempt fast client-side redirect from inside the new tab
              try {
                window.location.replace(${JSON.stringify(fullUrl)});
              } catch (e) {
                // fallback to meta refresh above
              }
            </script>
          </head>
          <body>
            <p>Opening check-in...</p>
          </body>
        </html>`;

      newWin.document.open();
      newWin.document.write(html);
      newWin.document.close();
    } catch (e) {
      // fallback: set location on the new window
      try { newWin.location.href = fullUrl; } catch (err) { /* ignore */ }
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
  }, [isLoading, firebaseUser, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vip': return 'text-purple-600 bg-purple-100';
      case 'early bird': return 'text-blue-600 bg-blue-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedEventData = assignedEvents.find(e => e.id.toString() === selectedEvent);

  const filteredAttendees = mockAttendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attendee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCheckins = mockRecentCheckins.length;
  const todayCheckins = mockRecentCheckins.filter(record => 
    new Date(record.checkedInAt).toDateString() === new Date().toDateString()
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  // Check if user is authorized
  if (!userProfile || userProfile.role !== 'checkin_officer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg mb-4 text-foreground">Access Denied</div>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Add CSV export helper
  function exportAttendeesCSV(attendees: Attendee[]) {
    const headers = ['Name', 'Email', 'Ticket ID', 'Ticket Type', 'Status', 'Checked In At'];
    const rows = attendees.map(a => [
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.ticketId}"`,
      `"${a.ticketType}"`,
      `"${a.status}"`,
      `"${a.checkedInAt || ''}"`
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendees.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-muted"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-muted"></div>

      {/* Content Container */}
      <div className="relative z-10 pt-8 px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto pb-16"
        >
          {/* Clean Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="rounded-2xl p-6 shadow-lg bg-primary border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-3xl font-bold mb-2 text-primary-foreground"
                  >
                    Check-in Dashboard
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal text-primary-foreground"
                  >
                    Welcome back, {userProfile?.firstName || 'Check-in Officer'}! 
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              onClick={() => setActiveTab('overview')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <TrendingUp className="h-8 w-8 mr-3" />
              Overview
            </Button>
            <Button 
              onClick={() => setActiveTab('events')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <Calendar className="h-8 w-8 mr-3" />
              My Events
            </Button>
            <Button 
              onClick={() => setActiveTab('attendees')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'attendees'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <Users className="h-8 w-8 mr-3" />
              Attendees
            </Button>
          </div>
          
          {activeTab === 'attendees' && (
            <div className="flex justify-end mt-4">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="appearance-none rounded-lg px-4 py-2 pr-8 bg-card border border-border text-foreground"
              >
                {assignedEvents.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 text-card-foreground">Today&apos;s Check-ins</p>
                  <div className="text-2xl font-bold mb-1 text-foreground">{todayCheckins}</div>
                </div>
                <div className="rounded-lg p-3 ml-4 bg-primary/10">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 text-card-foreground">Total Check-ins</p>
                  <div className="text-2xl font-bold mb-1 text-foreground">{totalCheckins}</div>
                </div>
                <div className="rounded-lg p-3 ml-4 bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 text-card-foreground">Assigned Events</p>
                  <div className="text-2xl font-bold mb-1 text-foreground">{totalEvents}</div>
                </div>
                <div className="rounded-lg p-3 ml-4 bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-xl border rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 text-card-foreground">Active Events</p>
                  <div className="text-2xl font-bold mb-1 text-foreground">{activeEvents}</div>
                </div>
                <div className="rounded-lg p-3 ml-4 bg-primary/10">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Check-ins</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-primary text-foreground hover:bg-primary/10"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {mockRecentCheckins.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center space-x-4 p-4 rounded-lg transition-colors duration-200 bg-muted/30">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{record.attendeeName}</p>
                          <p className="text-xs text-muted-foreground">{record.ticketId} • {record.eventTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {record.ticketType}
                          </span>
                          <p className="text-xs mt-1 text-muted-foreground">
                            {new Date(record.checkedInAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300 bg-card border-border">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20">
                    <QrCode className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Quick Scan</h3>
                  <p className="text-sm mb-4 text-muted-foreground">Start scanning tickets for active events</p>
                  <Button 
                    className="w-full text-primary-foreground bg-primary hover:bg-primary/90 text-base font-medium"
                    onClick={openScannerModal}
                  >
                    Start Scanning
                  </Button>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300 bg-card border-border">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">View Attendees</h3>
                  <p className="text-sm mb-4 text-muted-foreground">Browse attendee list and check-in status</p>
                  <Button 
                    variant="outline" 
                    className="w-full transition-all duration-200 hover:shadow-md border-border text-foreground hover:bg-accent/20 text-base font-medium"
                    onClick={() => setActiveTab('attendees')}
                  >
                    View List
                  </Button>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300 bg-card border-border">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Export Data</h3>
                  <p className="text-sm mb-4 text-muted-foreground">Download check-in reports and logs</p>
                  <Button 
                    variant="outline" 
                    className="w-full transition-all duration-200 hover:shadow-md border-border text-foreground hover:bg-accent/20 text-base font-medium"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loading
                  size="lg"
                  text="Loading your assigned events..."
                />
              </div>
            ) : assignedEvents.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No assigned events found.</p>
              </div>
            ) : (
              assignedEvents.map((event) => (
                <div key={event.id} className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300 bg-card border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium mb-1 text-foreground">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{event.organizer?.name || 'Unknown Organizer'}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEventStatus(event))}`}>
                      {getEventStatus(event)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary-foreground" />
                      <span>{formatDate(event.startDate)} at {formatTime(event.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary-foreground" />
                      <span>{event.venue?.name || 'Venue TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-primary-foreground" />
                      <span>0 / {event.capacity} checked in</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                      <span>Check-in Progress</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full rounded-full h-2 bg-muted">
                      <div 
                        className="h-2 rounded-full bg-primary" 
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                  </div>
                {/* TODO : implement the checkin count */}
                  <div className="mb-4 p-3 rounded-lg" >
                    <div className="text-sm text-black" >My Check-ins</div>
                    <div className="text-2xl font-bold" >0</div>
                  </div>

                  <div className="flex space-x-2">
                    {getEventStatus(event) === 'active' ? (
                      <button
                        type="button"
                        onClick={openScannerModal}
                        className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium text-primary-foreground shadow-md transition-all duration-200 bg-primary"
                      >
                        <Scan className="w-4 h-4 mr-1" />
                        Check-in
                      </button>
                    ) : (
                      <button
                        className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium text-primary-foreground shadow-md opacity-50 cursor-not-allowed bg-primary"
                        disabled
                      >
                        <Scan className="w-4 h-4 mr-1" />
                        Check-in
                      </button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10"
                      onClick={() => {
                        setSelectedEvent(event.id.toString());
                        setActiveTab('attendees');
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'checkin' && selectedEventData && (
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedEventData.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEventData.venue?.name || 'Venue TBD'}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getEventStatus(selectedEventData))}`}>
                  {getEventStatus(selectedEventData)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-foreground">{selectedEventData.capacity}</div>
                  <div className="text-sm text-muted-foreground">Total Capacity</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Checked In</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">My Check-ins</div>
                </div>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl text-center bg-card border-border">
              <div className="max-w-md mx-auto">
                {!scannerActive ? (
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20">
                      <QrCode className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-foreground">QR Code Scanner</h3>
                    <p className="text-sm mb-6 text-muted-foreground">
                      Tap the button below to activate the QR code scanner and check in attendees
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => setScannerActive(true)}
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Activate Scanner
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-64 h-64 rounded-lg mx-auto mb-4 flex items-center justify-center bg-background border">
                      <div className="text-center text-foreground">
                        <QrCode className="w-16 h-16 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Camera Active</p>
                        <p className="text-xs text-muted-foreground">Point camera at QR code</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10"
                        onClick={() => setScannerActive(false)}
                      >
                        Stop Scanner
                      </Button>
                      <Button className="flex-1 text-white bg-blue-600 hover:bg-blue-700">
                        Manual Entry
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden bg-card border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Attendee List</h2>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {selectedEventData?.title} - {filteredAttendees.length} attendees
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAttendeesCSV(filteredAttendees)}
                    className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              {/* Attendees filter/search controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center mt-6">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg w-full bg-background border border-border text-foreground placeholder-muted-foreground"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-lg px-4 py-2 pr-8 bg-background border border-border text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="transition-colors duration-200 border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-muted/30">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{attendee.name}</div>
                            <div className="text-sm text-muted-foreground">{attendee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{attendee.ticketId}</div>
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          {attendee.ticketType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {attendee.status === 'checked_in' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted/30 text-foreground">
                            <Clock4 className="w-3 h-3 mr-1 text-foreground" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'Not checked in'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {attendee.status === 'pending' ? (
                          <Button 
                            size="sm" 
                            className="text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Check In
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

        {/* Scanner Modal */}
        {scannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative bg-card border border-border">
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={() => setScannerModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center bg-primary/20">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Check-in Scanner</h2>
              <p className="text-sm mb-4 text-muted-foreground">Scan tickets for event</p>
              {/* Camera preview or error */}
              {cameraError ? (
                <div className="border-2 rounded-lg p-6 mb-4 border-red-300 text-red-500">
                  {cameraError}
                </div>
              ) : cameraStream ? (
                <video
                  autoPlay
                  playsInline
                  style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                  ref={video => {
                    if (video && cameraStream) {
                      video.srcObject = cameraStream;
                    }
                  }}
                />
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 mb-4 border-muted">
                  <p className="text-sm text-muted-foreground">Scanner placeholder — integrate camera/QR scanner here.</p>
                </div>
              )}
              <Button variant="outline" className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10" onClick={() => setScannerModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
