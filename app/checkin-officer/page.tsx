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
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-purple-800 text-lg">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50/50 via-purple-50/50 to-orange-50/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">Check-in Dashboard</h1>
              <p className="text-purple-700">Scan tickets and manage event check-ins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/80 border border-green-100 rounded-2xl p-6 shadow-xl shadow-green-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today&apos;s Check-ins</p>
                <p className="text-3xl font-bold text-green-600">{todayCheckins}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Check-ins</p>
                <p className="text-3xl font-bold text-blue-600">{totalCheckins}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 border border-purple-100 rounded-2xl p-6 shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Assigned Events</p>
                <p className="text-3xl font-bold text-purple-600">{mockAssignedEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 border border-orange-100 rounded-2xl p-6 shadow-xl shadow-orange-100/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Events</p>
                <p className="text-3xl font-bold text-orange-600">
                  {mockAssignedEvents.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
  <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-6 shadow-xl shadow-purple-100/50 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-md'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-md'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>My Events</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('attendees')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'attendees'
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-md'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Attendees</span>
                </div>
              </button>
            </div>
            
            {activeTab === 'attendees' && (
              <div className="flex items-center space-x-4">
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-6 shadow-xl shadow-purple-100/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Check-ins</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="space-y-4">
                {mockRecentCheckins.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{record.attendeeName}</p>
                          <p className="text-xs text-gray-600">{record.ticketId} • {record.eventTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTicketTypeColor(record.ticketType)}`}>
                            {record.ticketType}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
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
              <div className="backdrop-blur-xl bg-white/80 border border-purple-100 rounded-2xl p-6 shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Scan</h3>
                  <p className="text-sm text-gray-600 mb-4">Start scanning tickets for active events</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
                    onClick={openScannerModal}
                  >
                    Start Scanning
                  </Button>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">View Attendees</h3>
                  <p className="text-sm text-gray-600 mb-4">Browse attendee list and check-in status</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                    onClick={() => setActiveTab('attendees')}
                  >
                    View List
                  </Button>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/80 border border-green-100 rounded-2xl p-6 shadow-xl shadow-green-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Export Data</h3>
                  <p className="text-sm text-gray-600 mb-4">Download check-in reports and logs</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
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
              <div key={event.id} className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-6 shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.organizer}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.checkedIn} / {event.totalTickets} checked in</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Check-in Progress</span>
                    <span>{Math.round((event.checkedIn / event.totalTickets) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(event.checkedIn / event.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">My Check-ins</div>
                  <div className="text-2xl font-bold text-purple-600">{event.myCheckins}</div>
                </div>

                <div className="flex space-x-2">
                  {event.status === 'active' ? (
                    <button
                      type="button"
                      onClick={openScannerModal}
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-md transition-all duration-200 hover:from-purple-600 hover:to-orange-600"
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      Check-in
                    </button>
                  ) : (
                    <button
                      className="flex-1 flex items-center justify-center h-10 px-4 py-2 rounded-md font-medium bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-md opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      Check-in
                    </button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
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
            <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-6 shadow-xl shadow-purple-100/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEventData.title}</h3>
                  <p className="text-sm text-gray-600">{selectedEventData.venue}</p>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEventData.status)}`}>
                  {selectedEventData.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{selectedEventData.totalTickets}</div>
                  <div className="text-sm text-gray-600">Total Tickets</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedEventData.checkedIn}</div>
                  <div className="text-sm text-gray-600">Checked In</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedEventData.myCheckins}</div>
                  <div className="text-sm text-gray-600">My Check-ins</div>
                </div>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl p-6 shadow-xl shadow-purple-100/50 text-center">
              <div className="max-w-md mx-auto">
                {!scannerActive ? (
                  <>
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Scanner</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Tap the button below to activate the QR code scanner and check in attendees
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
                      onClick={() => setScannerActive(true)}
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Activate Scanner
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-64 h-64 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-white text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Camera Active</p>
                        <p className="text-xs text-gray-300">Point camera at QR code</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setScannerActive(false)}
                      >
                        Stop Scanner
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
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
          <div className="backdrop-blur-xl bg-white/80 border border-purple-200 rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Attendee List</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedEventData?.title} - {filteredAttendees.length} attendees
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportAttendeesCSV(filteredAttendees)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              {/* Attendees filter/search controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center mt-6">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="checked_in">Checked In</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                            <div className="text-sm text-gray-500">{attendee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{attendee.ticketId}</div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTicketTypeColor(attendee.ticketType)}`}>
                          {attendee.ticketType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {attendee.status === 'checked_in' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock4 className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'Not checked in'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {attendee.status === 'pending' ? (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Check In
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setScannerModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="mx-auto mb-4 w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
                <QrCode className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Check-in Scanner</h2>
              <p className="text-sm text-gray-600 mb-4">Scan tickets for event</p>
              {/* Camera preview or error */}
              {cameraError ? (
                <div className="border-2 border-red-200 rounded-lg p-6 mb-4 text-red-600">
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
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 mb-4">
                  <p className="text-sm text-gray-500">Scanner placeholder — integrate camera/QR scanner here.</p>
                </div>
              )}
              <Button variant="outline" onClick={() => setScannerModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
