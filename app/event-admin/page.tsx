'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { 
  Edit,
  Calendar, 
  Users, 
  Eye,
  UserPlus,
  Settings,
  Activity,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Clock4
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: 'active' | 'upcoming' | 'completed';
  attendees: number;
  maxCapacity: number;
  checkedIn: number;
  organizer: string;
  category: string;
}

interface CheckinOfficer {
  id: string;
  name: string;
  email: string;
  assignedEvents: number;
  totalCheckins: number;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: '2024-12-15',
    time: '09:00',
    venue: 'Convention Center Hall A',
    status: 'upcoming',
    attendees: 450,
    maxCapacity: 500,
    checkedIn: 0,
    organizer: 'Sarah Johnson',
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    date: '2024-07-20',
    time: '18:00',
    venue: 'Central Park Amphitheater',
    status: 'active',
    attendees: 1800,
    maxCapacity: 2000,
    checkedIn: 1250,
    organizer: 'Mike Chen',
    category: 'Music'
  },
  {
    id: '3',
    title: 'Food & Wine Expo',
    date: '2024-06-08',
    time: '11:00',
    venue: 'Downtown Exhibition Center',
    status: 'completed',
    attendees: 280,
    maxCapacity: 300,
    checkedIn: 280,
    organizer: 'Emma Davis',
    category: 'Food & Beverage'
  }
];

const mockOfficers: CheckinOfficer[] = [
  {
    id: '1',
    name: 'Alice Brown',
    email: 'alice@nexticket.com',
    assignedEvents: 3,
    totalCheckins: 1250
  },
  {
    id: '2',
    name: 'David Wilson',
    email: 'david@nexticket.com',
    assignedEvents: 2,
    totalCheckins: 890
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma@nexticket.com',
    assignedEvents: 1,
    totalCheckins: 340
  }
];

export default function EventAdminDashboard() {
  const { userProfile, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'officers' | 'manage-tickets'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add state for event details modal
  const [eventDetails, setEventDetails] = useState<Event | null>(null);

  // Add state for Add Officer modal
  const [addOfficerEventId, setAddOfficerEventId] = useState<string | null>(null);

  // Redirect if not authenticated or not event admin
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
    // Add role check here when authentication is implemented
    // if (userProfile && userProfile.role !== 'event_admin') {
    //   router.push('/dashboard');
    // }
  }, [isLoading, firebaseUser, userProfile, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOfficerStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: '#AF1761' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Event Administration</h1>
              <p className="text-purple-100">Manage events and check-in officers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: '#0DCAF0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Events</p>
                <p className="text-3xl font-bold text-purple-600">
                  {mockEvents.filter(e => e.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: '#0DCAF0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Check-ins</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockEvents.reduce((sum, event) => sum + event.checkedIn, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: '#0DCAF0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Officers</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: '#0DCAF0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold text-orange-600">
                  {mockEvents.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Make the tab bar scrollable horizontally */}
            <div
              className="flex items-center space-x-4 overflow-x-auto w-full"
              style={{
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
                scrollbarWidth: 'thin'
              }}
            >
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
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
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Events ({mockEvents.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('officers')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'officers'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
              </button>
              <button
                onClick={() => setActiveTab('manage-tickets')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'manage-tickets'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>Manage Tickets</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Summer Music Festival check-in completed</p>
                    <p className="text-xs text-gray-600">1,250 attendees checked in successfully</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Clock4 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tech Innovation Summit scheduled</p>
                    <p className="text-xs text-gray-600">Event starts in 3 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <UserPlus className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New check-in officer assigned</p>
                    <p className="text-xs text-gray-600">Emma Thompson added to the team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Performance</h3>
                <div className="space-y-3">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-600">{event.venue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{event.checkedIn}/{event.attendees}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-purple-600 h-1 rounded-full" 
                            style={{ width: `${(event.checkedIn / event.attendees) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Officer Performance</h3>
                <div className="space-y-3">
                  {mockOfficers.map((officer) => (
                    <div key={officer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">{officer.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{officer.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{officer.totalCheckins}</p>
                        <p className="text-xs text-gray-600">total check-ins</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Event Management</h2>
                <p className="text-sm text-gray-600 mt-1">Monitor and manage all events</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.venue}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{event.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{event.checkedIn} / {event.attendees}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(event.checkedIn / event.attendees) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                            onClick={() => setEventDetails(event)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button> */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => setEventDetails(event)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Event Details Modal/Window */}
            {eventDetails && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
                {/* Modal content: scrollable and with gap between sections */}
                <div
                  className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full relative border border-gray-200 overflow-y-auto"
                  style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                    onClick={() => setEventDetails(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <div className="mb-6">
                    <h2 className="text-3xl font-extrabold mb-2 text-gray-900">{eventDetails.title}</h2>
                    <div className="flex items-center mb-2 text-gray-600">
                      <Calendar className="inline w-5 h-5 mr-2 text-blue-500" />
                      <span>{eventDetails.venue}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2"
                        style={{
                          backgroundColor:
                            eventDetails.status === 'active'
                              ? '#D1FAE5'
                              : eventDetails.status === 'upcoming'
                              ? '#DBEAFE'
                              : '#F3F4F6',
                          color:
                            eventDetails.status === 'active'
                              ? '#059669'
                              : eventDetails.status === 'upcoming'
                              ? '#2563EB'
                              : '#6B7280'
                        }}
                      >
                        {eventDetails.status}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(eventDetails.date).toLocaleDateString()} {eventDetails.time}
                      </span>
                    </div>
                  </div>
                  {/* Notices Section */}
                  <div className="mt-8 mb-8">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Event Notices
                    </h3>
                    <form
                      className="space-y-3"
                      onSubmit={e => {
                        e.preventDefault();
                        // Implement add notice logic here
                      }}
                    >
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={3}
                        placeholder="Add a notice about this event..."
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Add Notice
                      </Button>
                    </form>
                    {/* List of notices (demo, static) */}
                    <div className="mt-4 space-y-2">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <span className="text-sm text-blue-800">Event parking will be available at Lot B.</span>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <span className="text-sm text-blue-800">Please bring your ticket QR code for faster check-in.</span>
                      </div>
                    </div>
                  </div>
                  {/* Check-in Officers Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-600" />
                      Check-in Officers
                    </h3>
                    <div className="space-y-3">
                      {mockOfficers.map(officer => (
                        <div key={officer.id} className="flex items-center bg-purple-50 rounded-lg px-4 py-3 shadow-sm">
                          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-lg font-bold text-purple-700">{officer.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{officer.name}</div>
                            <div className="text-xs text-gray-500">{officer.email}</div>
                          </div>
                          <div className="text-xs text-gray-700 ml-4">
                            <span className="font-semibold">{officer.totalCheckins}</span> check-ins
                          </div>
                        </div>
                      ))}
                      {mockOfficers.length === 0 && (
                        <div className="text-gray-500 text-sm">No officers assigned yet.</div>
                      )}
                    </div>
                    {/* Add Officer Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => setAddOfficerEventId(eventDetails.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Check-in Officer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Check-in Officers</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage check-in officer assignments</p>
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setAddOfficerEventId('select')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Officer
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {mockOfficers.map((officer) => (
                <div key={officer.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-600">{officer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{officer.name}</h3>
                      <p className="text-sm text-gray-600">{officer.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assigned Events</span>
                      <span className="text-sm font-medium text-gray-900">{officer.assignedEvents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Check-ins</span>
                      <span className="text-sm font-medium text-gray-900">{officer.totalCheckins}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 text-purple-600 border-purple-600 hover:bg-purple-50"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Officer Modal */}
        {addOfficerEventId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setAddOfficerEventId(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Assign Officer to Event</h2>
              {/* Step 1: Select Event */}
              {addOfficerEventId === 'select' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                    onChange={e => setAddOfficerEventId(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select an event...</option>
                    {mockEvents.map(event => (
                      <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                  </select>
                </>
              )}
              {/* Step 2: Assign Officer */}
              {addOfficerEventId !== 'select' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Officer</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4">
                    <option value="" disabled>Select an officer...</option>
                    {mockOfficers.map(officer => (
                      <option key={officer.id} value={officer.id}>{officer.name} ({officer.email})</option>
                    ))}
                  </select>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Assign Officer
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manage-tickets' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Manage Tickets</h2>
              <p className="text-sm text-gray-600 mt-1">Add tickets for events</p>
            </div>
            <div className="p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{event.venue}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => {/* Implement add ticket logic here */}}
                          >
                            Add Tickets
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => {/* Implement manage discounts logic here */}}
                          >
                            Manage Discounts
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
