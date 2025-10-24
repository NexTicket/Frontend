'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Clock4
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchMyCheckinEvents, fetchEventAttendees } from '@/lib/api';
import { secureFetch } from '@/utils/secureFetch';
import RouteGuard from '@/components/auth/routeGuard';
import jsQR from 'jsqr';

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
  order_id: string;
  ticketType: string;
  status: string;
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
    order_id: 'BT-1',
    ticketType: 'VIP',
    status: 'Available'
  },
  {
    id: '2',
    order_id: 'BT-2',
    ticketType: 'General',
    status: 'Available'
  },
  {
    id: '3',
    order_id: 'BT-3',
    ticketType: 'Balcony',
    status: 'Available'
  }
];

export default function CheckinOfficerDashboard() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'events' | 'checkin' | 'attendees'>('events');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [assignedEvents, setAssignedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [eventCheckinCounts, setEventCheckinCounts] = useState<{[key: string]: number}>({});
  const [scanCooldown, setScanCooldown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setScanResult(null);
    setScanning(false);
    // Show warning and try to access camera
    setTimeout(() => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera with specific constraints for better QR scanning
        navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
          .then(stream => {
            setCameraStream(stream);
            setCameraError(null);
          })
          .catch(err => {
            console.error('Camera access error:', err);
            let errorMessage = 'Unable to access camera. ';
            if (err.name === 'NotAllowedError') {
              errorMessage += 'Please allow camera permission and try again.';
            } else if (err.name === 'NotFoundError') {
              errorMessage += 'No camera found. Please connect a camera and try again.';
            } else if (err.name === 'NotReadableError') {
              errorMessage += 'Camera is already in use by another application.';
            } else {
              errorMessage += 'Please check your camera settings and try again.';
            }
            setCameraError(errorMessage);
          });
      } else {
        setCameraError('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
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

  const loadAttendeesForEvent = useCallback(async (eventId: string) => {
    setLoadingAttendees(true);
    try {
      console.log('🎯 Fetching bulk tickets for event:', eventId);
      const data = await fetchEventAttendees(eventId);
      console.log('📦 Raw API response:', data);
      console.log('📊 Data type:', typeof data, 'Is Array:', Array.isArray(data));
      
      // Handle different response formats
      let bulkTickets = data;
      if (data && typeof data === 'object') {
        if (data.data) bulkTickets = data.data;
        else if (data.bulk_tickets) bulkTickets = data.bulk_tickets;
        else if (Array.isArray(data)) bulkTickets = data;
      }
      
      // Map bulk tickets to attendee format
      // Status logic: If any tickets are sold but not checked in, show "pending"
      // If all sold tickets are checked in, show "checked-in"
      // If no tickets sold yet, show availability
      const attendeeList = Array.isArray(bulkTickets) ? bulkTickets.map((bt: any) => {
        const soldCount = bt.total_seats - bt.available_seats;
        const checkedInCount = bt.checked_in_count || 0;
        let status = '';
        
        if (soldCount === 0) {
          // No tickets sold yet
          status = `${bt.available_seats} available`;
        } else if (checkedInCount === soldCount && soldCount > 0) {
          // All sold tickets are checked in
          status = 'Checked-in';
        } else if (checkedInCount > 0) {
          // Some tickets checked in
          status = `${checkedInCount}/${soldCount} checked-in`;
        } else if (bt.available_seats === 0) {
          // All tickets sold but none checked in yet
          status = 'Pending Check-in';
        } else {
          // Partially sold
          status = `${soldCount} sold, ${bt.available_seats} available`;
        }
        
        return {
          id: bt.id.toString(),
          order_id: bt.id.toString(),
          ticketType: bt.seat_type,
          status: status,
          totalSeats: bt.total_seats,
          availableSeats: bt.available_seats,
          soldSeats: soldCount,
          checkedInCount: checkedInCount
        };
      }) : [];
      
      setAttendees(attendeeList);
      console.log('👥 Loaded bulk tickets as attendees:', attendeeList);
    } catch (error) {
      console.error('❌ Failed to load bulk tickets:', error);
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  }, []);

  const handleQRCodeScanned = useCallback(async (qrData: string) => {
    setCheckinLoading(true);
    console.log('🎫 Processing QR code scan...', qrData);
    
    try {
      // Parse QR code data
      let qrInfo;
      try {
        qrInfo = JSON.parse(qrData);
        console.log('📋 Parsed QR data:', qrInfo);
      } catch (parseError) {
        console.error('❌ Invalid QR code format:', parseError);
        setScanResult({ 
          success: false, 
          error: 'Invalid QR code format. Please scan a valid ticket QR code.' 
        });
        return;
      }
      
      // Validate required fields
      if (!qrInfo.ticket_id && !qrInfo.id) {
        setScanResult({ success: false, error: 'QR code missing ticket ID' });
        return;
      }
      if (!qrInfo.venue_id) {
        setScanResult({ success: false, error: 'QR code missing venue ID' });
        return;
      }
      if (!qrInfo.firebase_uid && !qrInfo.user_id) {
        setScanResult({ success: false, error: 'QR code missing user ID' });
        return;
      }
      
      // Send structured data to match backend expectations
      const checkInData = {
        ticket_id: qrInfo.ticket_id || qrInfo.id,
        event_id: parseInt(qrInfo.event_id || selectedEvent),
        venue_id: parseInt(qrInfo.venue_id),
        seat: qrInfo.seat || qrInfo.seat_info,
        firebase_uid: qrInfo.firebase_uid || qrInfo.user_id,
        order_ref: qrInfo.order_ref || qrInfo.order_reference
      };

      console.log('📤 Sending check-in request:', checkInData);

      // Use secureFetch with authentication
      // URL format: /ticket_service/tickets/check-in (no /api prefix)
      const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5051';
      const checkInUrl = `${API_GATEWAY_URL}/ticket_service/tickets/check-in`;
      console.log('🔗 Check-in URL:', checkInUrl);
      
      const response = await secureFetch(checkInUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkInData),
      });

      console.log('📥 Response status:', response.status, response.statusText);
      
      // Check if response is JSON before parsing
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Non-JSON response (likely HTML error page)
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        result = { 
          detail: `Server error: ${response.status} ${response.statusText}. Check API Gateway and ticket service logs.` 
        };
      }
      
      console.log('📥 Check-in response:', result);

      if (response.ok) {
        console.log('✅ Check-in successful!');
        const currentEvent = assignedEvents.find(e => e.id.toString() === selectedEvent);
        
        // Format the seat as a string to avoid rendering object in React
        const formattedSeat = result.seat 
          ? `${result.seat.section} R${result.seat.row_id} C${result.seat.col_id}` 
          : 'Unknown';
        
        const successData = {
          ...result, // Spread first
          message: result.message || 'Check-in successful!',
          ticket_id: result.ticket_id,
          seat: formattedSeat, // Override with formatted string
          checked_in_at: result.checked_in_at,
          attendee_name: result.attendee_name || 'Guest',
          event_name: result.event_name || currentEvent?.name || 'Event'
        };
        
        setScanResult({ 
          success: true,
          ...successData
        });
        
        // Increment check-in count for this event
        const eventId = result.event_id?.toString() || selectedEvent;
        if (eventId) {
          setEventCheckinCounts(prev => ({
            ...prev,
            [eventId]: (prev[eventId] || 0) + 1
          }));
        }
        
        // Start 5-second cooldown to prevent rapid re-scans
        setScanCooldown(5);
        const cooldownInterval = setInterval(() => {
          setScanCooldown(prev => {
            if (prev <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Refresh attendees list to show updated status
        if (selectedEvent) {
          await loadAttendeesForEvent(selectedEvent);
        }
      } else {
        console.error('❌ Check-in failed:', result);
        setScanResult({ 
          success: false, 
          error: result.detail || result.message || 'Check-in failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('❌ QR scan error:', error);
      setScanResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process check-in. Please try again.' 
      });
    } finally {
      setCheckinLoading(false);
    }
  }, [selectedEvent, loadAttendeesForEvent, assignedEvents]);

  // QR scanning logic
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setScanning(true);
    setScanResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const scan = () => {
      if (!scanning || !video.videoWidth || !video.videoHeight) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && scanCooldown === 0) {
        setScanning(false);
        handleQRCodeScanned(code.data);
        return;
      }

      requestAnimationFrame(scan);
    };

    scan();
  }, [scanning, handleQRCodeScanned, scanCooldown]);

  // Assign camera stream to video element when available
  useEffect(() => {
    if (cameraStream && videoRef.current && scannerModalOpen) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().then(() => {
        startScanning();
      }).catch(err => {
        console.error('Error playing video:', err);
        setCameraError('Failed to start camera preview');
      });
    }
  }, [cameraStream, scannerModalOpen, startScanning]);

  // Load attendees when selected event changes or when on attendees tab
  useEffect(() => {
    if (selectedEvent && activeTab === 'attendees') {
      loadAttendeesForEvent(selectedEvent);
    }
  }, [selectedEvent, activeTab, loadAttendeesForEvent]);

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

  const selectedEventData = assignedEvents.find(e => e.id.toString() === selectedEvent);

  const filteredAttendees = attendees.filter(attendee => {
    // Filter by search term (order_id or ticketType for bulk tickets)
    const matchesSearch = searchTerm === '' || 
                         attendee.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.ticketType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status (for bulk tickets, status shows availability)
    const matchesStatus = statusFilter === 'all' || 
                         attendee.status?.toLowerCase().includes(statusFilter.toLowerCase());
    
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
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Add CSV export helper
  function exportAttendeesCSV(attendees: Attendee[]) {
    const headers = ['Order ID', 'Ticket Section', 'Status'];
    const rows = attendees.map(a => [
      `"${a.order_id}"`,
      `"${a.ticketType}"`,
      `"${a.status}"`
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_tickets.csv';
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
              onClick={() => setActiveTab('checkin')}
              className={`h-10 backdrop-blur-xl border text-lg rounded-2xl p-8 shadow-xl transition-all duration-200 ${
                activeTab === 'checkin'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-card/80 text-card-foreground'
              }`}
            >
              <Scan className="h-8 w-8 mr-3" />
              Check-in
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
              assignedEvents.map((event) => {
                const eventId = event.id.toString();
                const checkinCount = eventCheckinCounts[eventId] || 0;
                const totalCapacity = event.capacity || 0;
                const checkinPercentage = totalCapacity > 0 ? Math.round((checkinCount / totalCapacity) * 100) : 0;
                
                return (
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
                        <span>{checkinCount} / {totalCapacity} checked in</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                        <span>Check-in Progress</span>
                        <span>{checkinPercentage}%</span>
                      </div>
                      <div className="w-full rounded-full h-2 bg-muted">
                        <div 
                          className="h-2 rounded-full bg-primary" 
                          style={{ width: `${checkinPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  {/* TODO : implement the checkin count */}
                    <div className="mb-4 p-3 rounded-lg" >
                      <div className="text-sm text-black" >My Check-ins</div>
                      <div className="text-2xl font-bold" >{checkinCount}</div>
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
                );
              })
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
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20">
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">QR Code Scanner</h3>
                <p className="text-sm mb-6 text-muted-foreground">
                  Tap the button below to activate the QR code scanner and check in attendees
                </p>
                {getEventStatus(selectedEventData) === 'active' ? (
                  <Button 
                    size="lg" 
                    className="w-full text-white bg-blue-600 hover:bg-blue-700"
                    onClick={openScannerModal}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Open Scanner
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Check-in is only available for events happening today.
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                        Event status: {getEventStatus(selectedEventData)}
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Scanner Unavailable
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden bg-card border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Bulk Tickets</h2>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {selectedEventData?.name || selectedEventData?.title} - {loadingAttendees ? 'Loading...' : `${filteredAttendees.length} bulk tickets`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAttendeesCSV(filteredAttendees)}
                    disabled={loadingAttendees}
                    className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => selectedEvent && loadAttendeesForEvent(selectedEvent)}
                    disabled={loadingAttendees}
                    className="transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingAttendees ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 items-center mt-6">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search bulk tickets..."
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
                  <option value="available">Available</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Ticket Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAttendees ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                          Loading bulk tickets...
                        </div>
                      </td>
                    </tr>
                  ) : filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        No bulk tickets found for this event.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((attendee) => {
                      const isCheckedIn = attendee.status === 'Checked-in' || attendee.status?.toLowerCase().includes('checked');
                      const isEventActive = selectedEventData && getEventStatus(selectedEventData) === 'active';
                      const canCheckIn = isEventActive && !isCheckedIn;
                      
                      return (
                        <tr key={attendee.id} className="transition-colors duration-200 border-b border-border hover:bg-muted/30">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">{attendee.order_id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              {attendee.ticketType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={openScannerModal}
                              disabled={!canCheckIn}
                              className={`transition-all duration-200 ${
                                !canCheckIn 
                                  ? 'opacity-50 cursor-not-allowed bg-primary' 
                                  : 'hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90'
                              }`}
                              title={!isEventActive ? 'Event is not active today' : isCheckedIn ? 'Already checked in' : 'Check in attendee'}
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              Check-in
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
              <div className="mb-4">
                <video
                  autoPlay
                  playsInline
                  style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                  ref={videoRef}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {scanning && scanCooldown === 0 && (
                  <div className="text-center text-sm text-muted-foreground flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Scanning for QR codes...
                  </div>
                )}
                {scanCooldown > 0 && (
                  <div className="text-center text-sm text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Clock4 className="w-4 h-4 mr-2" />
                    Cooldown: {scanCooldown}s before next scan
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 mb-4 border-muted">
                <p className="text-sm text-muted-foreground">Initializing camera...</p>
              </div>
            )}

            {/* Scan result */}
            {scanResult && (
              <div className={`border-2 rounded-lg p-4 mb-4 ${
                scanResult.success 
                  ? 'border-green-300 bg-green-50 text-green-800' 
                  : 'border-red-300 bg-red-50 text-red-800'
              }`}>
                {scanResult.success ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Check-in Successful!</span>
                    </div>
                    <p className="text-sm">Attendee: {scanResult.attendee_name}</p>
                    <p className="text-sm">Event: {scanResult.event_name}</p>
                    <p className="text-sm">Seat: {scanResult.seat}</p>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold mb-2">Check-in Failed</div>
                    <p className="text-sm">{scanResult.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading state */}
            {checkinLoading && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Processing check-in...
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1 transition-all duration-200 hover:shadow-md border-primary text-foreground hover:bg-primary/10" 
                onClick={() => setScannerModalOpen(false)}
              >
                Close
              </Button>
              {scanResult?.success && (
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setScanResult(null);
                    setScanning(true);
                    startScanning();
                  }}
                >
                  Scan Next
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      </motion.div>
    </div>
    </div>
  );
}
