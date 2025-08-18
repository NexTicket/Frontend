'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

interface EventRequest {
  id: string;
  title: string;
  organizer: string;
  organizerEmail: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  category: string;
  expectedAttendees: number;
  ticketPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  eventAdmin?: string;
  checkinOfficers?: string[];
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'event_admin' | 'checkin_officer';
  isAvailable: boolean;
  assignedEvents: string[];
  displayName?: string;
  firstName?: string;
  lastName?: string;
}

const mockEventRequests: EventRequest[] = [
  {
    id: 'req-001',
    title: 'Tech Innovation Summit 2024',
    organizer: 'Sarah Johnson',
    organizerEmail: 'sarah@techsummit.com',
    date: '2024-12-15',
    time: '09:00',
    venue: 'Convention Center Hall A',
    description: 'A comprehensive technology conference featuring the latest innovations in AI, blockchain, and cloud computing.',
    category: 'Technology',
    expectedAttendees: 500,
    ticketPrice: 299,
    status: 'pending',
    submittedAt: '2024-08-15T10:30:00Z'
  },
  {
    id: 'req-002',
    title: 'Summer Music Festival',
    organizer: 'Mike Chen',
    organizerEmail: 'mike@musicfest.com',
    date: '2024-07-20',
    time: '18:00',
    venue: 'Central Park Amphitheater',
    description: 'Three-day outdoor music festival featuring local and international artists.',
    category: 'Music',
    expectedAttendees: 2000,
    ticketPrice: 89,
    status: 'approved',
    submittedAt: '2024-06-10T14:20:00Z',
    eventAdmin: 'John Smith',
    checkinOfficers: ['Alice Brown', 'David Wilson']
  },
  {
    id: 'req-003',
    title: 'Food & Wine Expo',
    organizer: 'Emma Davis',
    organizerEmail: 'emma@foodexpo.com',
    date: '2024-09-08',
    time: '11:00',
    venue: 'Downtown Exhibition Center',
    description: 'Culinary showcase featuring top chefs and premium wine tastings.',
    category: 'Food & Beverage',
    expectedAttendees: 300,
    ticketPrice: 149,
    status: 'rejected',
    submittedAt: '2024-07-25T09:15:00Z'
  }
];

const mockStaff: Staff[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@nexticket.com', role: 'event_admin', isAvailable: true, assignedEvents: [] },
  { id: '2', name: 'Jane Doe', email: 'jane.doe@nexticket.com', role: 'event_admin', isAvailable: false, assignedEvents: ['event-1'] },
  { id: '3', name: 'Alice Brown', email: 'alice.brown@nexticket.com', role: 'checkin_officer', isAvailable: true, assignedEvents: [] },
  { id: '4', name: 'David Wilson', email: 'david.wilson@nexticket.com', role: 'checkin_officer', isAvailable: true, assignedEvents: [] },
  { id: '5', name: 'Carol White', email: 'carol.white@nexticket.com', role: 'checkin_officer', isAvailable: true, assignedEvents: ['event-1'] },
  { id: '6', name: 'Bob Johnson', email: 'bob.johnson@nexticket.com', role: 'checkin_officer', isAvailable: false, assignedEvents: ['event-2'] }
];

export default function AdminEvents() {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>(mockEventRequests);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedEventAdmin, setSelectedEventAdmin] = useState('');
  const [selectedCheckinOfficers, setSelectedCheckinOfficers] = useState<string[]>([]);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [loading, setLoading] = useState(false);

  // Fetch staff data from Firebase
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const staffUsers: Staff[] = [];

      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 'event_admin' || userData.role === 'checkin_officer') {
          staffUsers.push({
            id: doc.id,
            name: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
            email: userData.email,
            role: userData.role,
            isAvailable: userData.staffProfile?.isAvailable ?? true,
            assignedEvents: userData.staffProfile?.assignedEvents || [],
            displayName: userData.displayName,
            firstName: userData.firstName,
            lastName: userData.lastName
          });
        }
      });

      setStaff(staffUsers);
      console.log('Fetched staff:', staffUsers);
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Fallback to mock data if Firebase fails
      setStaff(mockStaff);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredRequests = eventRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApprove = (requestId: string) => {
    const request = eventRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowAssignmentModal(true);
    }
  };

  const handleReject = (requestId: string) => {
    setEventRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' as const }
          : request
      )
    );
  };

  const handleAssignStaff = async () => {
    if (selectedRequest && selectedEventAdmin && selectedCheckinOfficers.length === 2) {
      try {
        const adminName = staff.find(s => s.id === selectedEventAdmin)?.name || '';
        const officerNames = selectedCheckinOfficers.map(id => 
          staff.find(s => s.id === id)?.name || ''
        );

        // Update event request status
        setEventRequests(prev => 
          prev.map(request => 
            request.id === selectedRequest.id 
              ? { 
                  ...request, 
                  status: 'approved' as const,
                  eventAdmin: adminName,
                  checkinOfficers: officerNames
                }
              : request
          )
        );

        // Update staff assignments in Firebase
        const staffToUpdate = [selectedEventAdmin, ...selectedCheckinOfficers];
        
        for (const staffId of staffToUpdate) {
          const staffMember = staff.find(s => s.id === staffId);
          if (staffMember) {
            const updatedAssignedEvents = [...(staffMember.assignedEvents || []), selectedRequest.id];
            
            await updateDoc(doc(db, 'users', staffId), {
              'staffProfile.assignedEvents': updatedAssignedEvents,
              'staffProfile.isAvailable': updatedAssignedEvents.length === 0 // Mark as unavailable if has assignments
            });
          }
        }

        // Update local staff state
        setStaff(prev => prev.map(s => {
          if (staffToUpdate.includes(s.id)) {
            return {
              ...s,
              assignedEvents: [...s.assignedEvents, selectedRequest.id],
              isAvailable: false
            };
          }
          return s;
        }));

        setShowAssignmentModal(false);
        setSelectedRequest(null);
        setSelectedEventAdmin('');
        setSelectedCheckinOfficers([]);
        
        console.log('Successfully assigned staff to event:', selectedRequest.title);
      } catch (error) {
        console.error('Error assigning staff:', error);
        alert('Failed to assign staff. Please try again.');
      }
    }
  };

  const handleCheckinOfficerToggle = (officerId: string) => {
    if (selectedCheckinOfficers.includes(officerId)) {
      setSelectedCheckinOfficers(prev => prev.filter(id => id !== officerId));
    } else if (selectedCheckinOfficers.length < 2) {
      setSelectedCheckinOfficers(prev => [...prev, officerId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-orange-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Event Management</h1>
              <p className="text-purple-100">Review and manage event requests</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{filteredRequests.length}</div>
              <div className="text-sm text-purple-100">Total Requests</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-purple-600">
                  {eventRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Events</p>
                <p className="text-3xl font-bold text-green-600">
                  {eventRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {eventRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Staff Available</p>
                <p className="text-3xl font-bold text-orange-600">
                  {staff.filter(s => s.isAvailable).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Showing {filteredRequests.length} requests</span>
            </div>
          </div>
        </div>

        {/* Event Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-500 to-orange-500 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{request.title}</h3>
                    <p className="text-purple-100 text-sm">by {request.organizer}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2 text-purple-500" />
                    {new Date(request.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-purple-500" />
                    {request.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    {request.venue}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-orange-500" />
                    {request.expectedAttendees} attendees
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                    <span className="font-semibold">${request.ticketPrice}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Submitted {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{request.description}</p>

                {/* Staff Assignments (for approved events) */}
                {request.status === 'approved' && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Staff Assigned:</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 mr-1 text-green-600" />
                        <span className="font-medium">Event Admin:</span>
                        <span className="ml-1">{request.eventAdmin}</span>
                      </div>
                      <div className="flex items-center">
                        <UserPlus className="w-3 h-3 mr-1 text-green-600" />
                        <span className="font-medium">Check-in Officers:</span>
                        <span className="ml-1">{request.checkinOfficers?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Button>

                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No requests found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedRequest && !showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-orange-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedRequest.title}</h2>
                  <p className="text-purple-100">Event Request Details</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm">{new Date(selectedRequest.date).toLocaleDateString()} at {selectedRequest.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm">{selectedRequest.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="text-sm">{selectedRequest.expectedAttendees} expected attendees</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">${selectedRequest.ticketPrice} per ticket</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Organizer Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedRequest.organizer}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedRequest.organizerEmail}</p>
                    <p className="text-sm"><span className="font-medium">Category:</span> {selectedRequest.category}</p>
                    <p className="text-sm"><span className="font-medium">Submitted:</span> {new Date(selectedRequest.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedRequest.description}</p>
              </div>

              {selectedRequest.status === 'approved' && selectedRequest.eventAdmin && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-3">Assigned Staff</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700">Event Admin:</p>
                      <p className="text-sm text-green-600">{selectedRequest.eventAdmin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Check-in Officers:</p>
                      <p className="text-sm text-green-600">{selectedRequest.checkinOfficers?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => handleReject(selectedRequest.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject Request
                    </Button>
                    <Button 
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve & Assign Staff
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {showAssignmentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-500 to-orange-500 p-6 text-white">
              <h2 className="text-2xl font-bold">Assign Staff</h2>
              <p className="text-purple-100">Assign event admin and check-in officers for "{selectedRequest.title}"</p>
            </div>

            <div className="p-6">
              {/* Event Admin Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Select Event Admin (1 required)</h3>
                <div className="space-y-2">
                  {staff.filter(s => s.role === 'event_admin' && s.isAvailable).map((staff) => (
                    <label key={staff.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                      <input
                        type="radio"
                        name="eventAdmin"
                        value={staff.id}
                        checked={selectedEventAdmin === staff.id}
                        onChange={(e) => setSelectedEventAdmin(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{staff.name}</p>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Check-in Officers Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Select Check-in Officers (2 required) - {selectedCheckinOfficers.length}/2 selected
                </h3>
                <div className="space-y-2">
                  {staff.filter(s => s.role === 'checkin_officer' && s.isAvailable).map((staff) => (
                    <label key={staff.id} className={`flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer ${
                      selectedCheckinOfficers.includes(staff.id) 
                        ? 'bg-orange-50 border-orange-200' 
                        : selectedCheckinOfficers.length >= 2
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-orange-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedCheckinOfficers.includes(staff.id)}
                        onChange={() => handleCheckinOfficerToggle(staff.id)}
                        disabled={selectedCheckinOfficers.length >= 2 && !selectedCheckinOfficers.includes(staff.id)}
                        className="mr-3"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{staff.name}</p>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedRequest(null);
                    setSelectedEventAdmin('');
                    setSelectedCheckinOfficers([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignStaff}
                  disabled={!selectedEventAdmin || selectedCheckinOfficers.length !== 2}
                  className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white disabled:opacity-50"
                >
                  Approve Event & Assign Staff
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}