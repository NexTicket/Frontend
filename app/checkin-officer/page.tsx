'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
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
  Clock4
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Theme to match admin dashboard
const darkBg = "#181A20";
const blueHeader = "#1877F2";
const cardBg = "#23262F";
const greenBorder = "#CBF83E" + '50';
const cardShadow = "0 2px 16px 0 rgba(57,253,72,0.08)";

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
  const [selectedEvent, setSelectedEvent] = useState<string>('2'); // Default to active event
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

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

  // Redirect if not authenticated or not checkin officer
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
    // Add role check here when authentication is implemented
    // if (userProfile && userProfile.role !== 'checkin_officer') {
    //   router.push('/dashboard');
    // }
  }, [isLoading, firebaseUser, userProfile, router]);

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

  const selectedEventData = mockAssignedEvents.find(e => e.id === selectedEvent);
  
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: darkBg }}>
        <div className="text-lg" style={{ color: '#fff' }}>Loading...</div>
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
    <div className="min-h-screen" style={{ background: darkBg }}>
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#ABA8A9' }}></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: blueHeader, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#fff' }}>Check-in Dashboard</h1>
                <p className="text-lg" style={{ color: '#fff' }}>Scan tickets and manage event check-ins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#fff' }}>Today&apos;s Check-ins</p>
                <p className="text-3xl font-bold" style={{ color: '#CBF83E' }}>{todayCheckins}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#D8DFEE' + '40' }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: '#CBF83E' }} />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#fff' }}>Total Check-ins</p>
                <p className="text-3xl font-bold" style={{ color: '#CBF83E' }}>{totalCheckins}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#D8DFEE' + '40' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#CBF83E' }} />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#fff' }}>Assigned Events</p>
                <p className="text-3xl font-bold" style={{ color: '#CBF83E' }}>{mockAssignedEvents.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#D8DFEE' + '40' }}>
                <Calendar className="w-6 h-6" style={{ color: '#CBF83E' }} />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#fff' }}>Active Events</p>
                <p className="text-3xl font-bold" style={{ color: '#CBF83E' }}>
                  {mockAssignedEvents.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#D8DFEE' + '40' }}>
                <Activity className="w-6 h-6" style={{ color: '#CBF83E' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
  <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl mb-8" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'text-white'
                    : ''
                }`}
                style={activeTab === 'overview' 
                  ? { backgroundColor: '#0D6EFD' }
                  : { color: '#fff' }}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" style={{ color: '#fff' }} />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'events'
                    ? 'text-white'
                    : ''
                }`}
                style={activeTab === 'events' 
                  ? { backgroundColor: '#0D6EFD' }
                  : { color: '#fff' }}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: '#fff' }} />
                  <span>My Events</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('attendees')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'attendees'
                    ? 'text-white'
                    : ''
                }`}
                style={activeTab === 'attendees' 
                  ? { backgroundColor: '#0D6EFD' }
                  : { color: '#fff' }}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" style={{ color: '#fff' }} />
                  <span>Attendees</span>
                </div>
              </button>
            </div>
            
            {activeTab === 'attendees' && (
              <div className="flex items-center space-x-4">
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="appearance-none rounded-lg px-4 py-2 pr-8"
                  style={{ backgroundColor: darkBg, border: `1px solid ${greenBorder}`, color: '#fff' }}
                >
                  {mockAssignedEvents.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>Recent Check-ins</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:shadow-md"
                  style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="space-y-4">
                {mockRecentCheckins.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center space-x-4 p-4 rounded-lg transition-colors duration-200" style={{ backgroundColor: '#1f222a' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: greenBorder + '20' }}>
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#CBF83E' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#fff' }}>{record.attendeeName}</p>
                          <p className="text-xs" style={{ color: '#ABA8A9' }}>{record.ticketId} • {record.eventTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium`} style={{ color: '#CBF83E', backgroundColor: greenBorder + '20' }}>
                            {record.ticketType}
                          </span>
                          <p className="text-xs mt-1" style={{ color: '#ABA8A9' }}>
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
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: greenBorder + '20' }}>
                    <QrCode className="w-8 h-8" style={{ color: '#CBF83E' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: '#fff' }}>Quick Scan</h3>
                  <p className="text-sm mb-4" style={{ color: '#ABA8A9' }}>Start scanning tickets for active events</p>
                  <Button 
                    className="w-full text-white"
                    style={{ background: '#0D6EFD' }}
                    onClick={openScannerModal}
                  >
                    Start Scanning
                  </Button>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: greenBorder + '20' }}>
                    <Users className="w-8 h-8" style={{ color: '#CBF83E' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: '#fff' }}>View Attendees</h3>
                  <p className="text-sm mb-4" style={{ color: '#ABA8A9' }}>Browse attendee list and check-in status</p>
                  <Button 
                    variant="outline" 
                    className="w-full transition-all duration-200 hover:shadow-md"
                    style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
                    onClick={() => setActiveTab('attendees')}
                  >
                    View List
                  </Button>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: greenBorder + '20' }}>
                    <Download className="w-8 h-8" style={{ color: '#CBF83E' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: '#fff' }}>Export Data</h3>
                  <p className="text-sm mb-4" style={{ color: '#ABA8A9' }}>Download check-in reports and logs</p>
                  <Button 
                    variant="outline" 
                    className="w-full transition-all duration-200 hover:shadow-md"
                    style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
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
            {mockAssignedEvents.map((event) => (
              <div key={event.id} className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium mb-1" style={{ color: '#fff' }}>{event.title}</h3>
                    <p className="text-sm" style={{ color: '#ABA8A9' }}>{event.organizer}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm" style={{ color: '#ABA8A9' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#fff' }} />
                    <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm" style={{ color: '#ABA8A9' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#fff' }} />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm" style={{ color: '#ABA8A9' }}>
                    <Users className="w-4 h-4" style={{ color: '#fff' }} />
                    <span>{event.checkedIn} / {event.totalTickets} checked in</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1" style={{ color: '#ABA8A9' }}>
                    <span>Check-in Progress</span>
                    <span>{Math.round((event.checkedIn / event.totalTickets) * 100)}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#1f222a' }}>
                    <div 
                      className="h-2 rounded-full" 
                      style={{ backgroundColor: '#0D6EFD', width: `${(event.checkedIn / event.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#1f222a' }}>
                  <div className="text-sm" style={{ color: '#ABA8A9' }}>My Check-ins</div>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>{event.myCheckins}</div>
                </div>

                <div className="flex space-x-2">
                  {event.status === 'active' ? (
                    <button
                      type="button"
                      onClick={openScannerModal}
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium text-white shadow-md transition-all duration-200"
                      style={{ background: '#0D6EFD' }}
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      Check-in
                    </button>
                  ) : (
                    <button
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium text-white shadow-md opacity-50 cursor-not-allowed"
                      style={{ background: '#0D6EFD' }}
                      disabled
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      Check-in
                    </button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="transition-all duration-200 hover:shadow-md"
                    style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
                    onClick={() => {
                      setSelectedEvent(event.id);
                      setActiveTab('attendees');
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'checkin' && selectedEventData && (
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#fff' }}>{selectedEventData.title}</h3>
                  <p className="text-sm" style={{ color: '#ABA8A9' }}>{selectedEventData.venue}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEventData.status)}`}>
                  {selectedEventData.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#1f222a' }}>
                  <div className="text-2xl font-bold" style={{ color: '#fff' }}>{selectedEventData.totalTickets}</div>
                  <div className="text-sm" style={{ color: '#ABA8A9' }}>Total Tickets</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#1f222a' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>{selectedEventData.checkedIn}</div>
                  <div className="text-sm" style={{ color: '#ABA8A9' }}>Checked In</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#1f222a' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>{selectedEventData.myCheckins}</div>
                  <div className="text-sm" style={{ color: '#ABA8A9' }}>My Check-ins</div>
                </div>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl text-center" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
              <div className="max-w-md mx-auto">
                {!scannerActive ? (
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: greenBorder + '20' }}>
                      <QrCode className="w-12 h-12" style={{ color: '#CBF83E' }} />
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: '#fff' }}>QR Code Scanner</h3>
                    <p className="text-sm mb-6" style={{ color: '#ABA8A9' }}>
                      Tap the button below to activate the QR code scanner and check in attendees
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full text-white"
                      style={{ background: '#0D6EFD' }}
                      onClick={() => setScannerActive(true)}
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Activate Scanner
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-64 h-64 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#0f1115' }}>
                      <div className="text-center" style={{ color: '#fff' }}>
                        <QrCode className="w-16 h-16 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Camera Active</p>
                        <p className="text-xs" style={{ color: '#ABA8A9' }}>Point camera at QR code</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 transition-all duration-200 hover:shadow-md"
                        style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
                        onClick={() => setScannerActive(false)}
                      >
                        Stop Scanner
                      </Button>
                      <Button className="flex-1 text-white" style={{ background: '#0D6EFD' }}>
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
          <div className="backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: cardBg, borderColor: greenBorder, boxShadow: cardShadow }}>
            <div className="p-6 border-b" style={{ borderColor: greenBorder }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: '#fff' }}>Attendee List</h2>
                  <p className="text-sm mt-1" style={{ color: '#ABA8A9' }}>
                    {selectedEventData?.title} - {filteredAttendees.length} attendees
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAttendeesCSV(filteredAttendees)}
                    className="transition-all duration-200 hover:shadow-md"
                    style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="transition-all duration-200 hover:shadow-md" style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              {/* Attendees filter/search controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center mt-6">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#ABA8A9' }} />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg w-full"
                    style={{ backgroundColor: darkBg, border: `1px solid ${greenBorder}`, color: '#fff' }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-lg px-4 py-2 pr-8"
                  style={{ backgroundColor: darkBg, border: `1px solid ${greenBorder}`, color: '#fff' }}
                >
                  <option value="all">All Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: '#1f222a' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fff' }}>
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fff' }}>
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fff' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fff' }}>
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fff' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="transition-colors duration-200" style={{ borderBottom: `1px solid ${greenBorder}20` }} onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#1f222a'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'; }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#1f222a' }}>
                            <User className="w-4 h-4" style={{ color: '#ABA8A9' }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#fff' }}>{attendee.name}</div>
                            <div className="text-sm" style={{ color: '#ABA8A9' }}>{attendee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: '#fff' }}>{attendee.ticketId}</div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium`} style={{ color: '#CBF83E', backgroundColor: greenBorder + '20' }}>
                          {attendee.ticketType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {attendee.status === 'checked_in' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ background: greenBorder + '20', color: '#CBF83E' }}>
                            <CheckCircle2 className="w-3 h-3 mr-1" style={{ color: '#CBF83E' }} />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ background: '#2a2d34', color: '#fff' }}>
                            <Clock4 className="w-3 h-3 mr-1" style={{ color: '#fff' }} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#ABA8A9' }}>
                        {attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'Not checked in'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {attendee.status === 'pending' ? (
                          <Button 
                            size="sm" 
                            className="text-white" 
                            style={{ background: '#0D6EFD' }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Check In
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="transition-all duration-200 hover:shadow-md"
                            style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }}
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

        {/* Scanner Modal */}
        {scannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative" style={{ backgroundColor: cardBg, border: `1px solid ${greenBorder}` }}>
              <button
                className="absolute top-4 right-4"
                style={{ color: '#ABA8A9' }}
                onClick={() => setScannerModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: greenBorder + '20' }}>
                <QrCode className="w-10 h-10" style={{ color: '#CBF83E' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#fff' }}>Check-in Scanner</h2>
              <p className="text-sm mb-4" style={{ color: '#ABA8A9' }}>Scan tickets for event</p>
              {/* Camera preview or error */}
              {cameraError ? (
                <div className="border-2 rounded-lg p-6 mb-4" style={{ borderColor: '#fca5a5', color: '#fca5a5' }}>
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
                <div className="border-2 border-dashed rounded-lg p-6 mb-4" style={{ borderColor: '#2a2d34' }}>
                  <p className="text-sm" style={{ color: '#ABA8A9' }}>Scanner placeholder — integrate camera/QR scanner here.</p>
                </div>
              )}
              <Button variant="outline" className="transition-all duration-200 hover:shadow-md" style={{ borderColor: greenBorder, color: '#fff', backgroundColor: 'transparent' }} onClick={() => setScannerModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
