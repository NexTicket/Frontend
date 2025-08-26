'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    <div className="min-h-screen" style={{ background: '#191C24' }}>
      {/* Simple Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#ABA8A9' }}></div>
      
      {/* Content Container */}
      <div className="relative z-10 pt-8 px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Clean Header */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="border rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#0D6EFD', borderColor: '#000' }}>
              <div className="flex items-center justify-between">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-3xl font-bold mb-2"
                    style={{ color: '#fff' }}
                  >
                    Event Management
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal"
                    style={{ color: '#fff' }}
                  >
                    Review and manage event requests across your platform
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="backdrop-blur-xl border rounded-3xl p-5 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>
                    {eventRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-5xs text-white font-medium">Pending</div>
                </div>
                <div className="backdrop-blur-xl border rounded-3xl p-5 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>
                    {eventRequests.filter(r => r.status === 'approved').length}
                  </div>
                  <div className="text-5xs text-white font-medium">Approved</div>
                </div>
                <div className="backdrop-blur-xl border rounded-3xl p-5 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>
                    {eventRequests.filter(r => r.status === 'rejected').length}
                  </div>
                  <div className="text-5xs text-white font-medium">Rejected</div>
                </div>
                <div className="backdrop-blur-xl border rounded-3xl p-5 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#CBF83E' }}>
                    {staff.filter(s => s.isAvailable).length}
                  </div>
                  <div className="text-5xs text-white font-medium">Staff Available</div>
                </div>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl border rounded-3xl p-5 shadow-xl" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search events or organizers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-white placeholder-white bg-transparent"
                        style={{ 
                          backgroundColor: 'transparent',
                          color: '#fff',
                          borderColor: '#39FD48' + '50'
                        }}
                      />
                    </div>
                    
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        style={{
                          backgroundColor: '#191C24',
                          color: '#fff',
                          borderColor: '#39FD48' + '50'
                        }}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-white">
                    <Filter className="w-4 h-4" />
                    <span>Showing {filteredRequests.length} requests</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Event Requests Grid */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="backdrop-blur-xl border rounded-3xl p-6 shadow-xl transition-all duration-300 hover:transform hover:scale-102 hover:shadow-2xl cursor-pointer" style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{request.title}</h3>
                        <p className="text-gray-300 text-sm">by {request.organizer}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm" style={{ color: '#0D6EFD' }}>
                          <CalendarIcon className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                          {new Date(request.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm" style={{ color: '#0D6EFD' }}>
                          <Clock className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }}/>
                          {request.time}
                        </div>
                        <div className="flex items-center text-sm" style={{ color: '#0D6EFD' }}>
                          <MapPin className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                          {request.venue}
                        </div>
                        <div className="flex items-center text-sm" style={{ color: '#0D6EFD' }}>
                          <Users className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                          {request.expectedAttendees} attendees
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* <div className="flex items-center text-sm" style={{ color: '#CBF83E' }}>
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">${request.ticketPrice}</span>
                        </div> */}
                        <div className="text-xs text-gray-400">
                          Submitted {new Date(request.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm line-clamp-2">{request.description}</p>

                      {/* Staff Assignments (for approved events) */}
                      {request.status === 'approved' && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                          <h4 className="text-sm font-semibold text-white mb-2">Staff Assigned:</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center">
                              <Shield className="w-3 h-3 mr-1" style={{ color: '#CBF83E' }} />
                              <span className="font-medium text-white">Event Admin:</span>
                              <span className="ml-1 text-gray-300">{request.eventAdmin}</span>
                            </div>
                            <div className="flex items-center">
                              <UserPlus className="w-3 h-3 mr-1" style={{ color: '#CBF83E' }} />
                              <span className="font-medium text-white">Check-in Officers:</span>
                              <span className="ml-1 text-gray-300">{request.checkinOfficers?.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#39FD48' + '30' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center space-x-2 text-white border hover:bg-gray-600"
                        style={{ backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' }}
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
                ))}
              </div>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No requests found</h3>
                  <p className="text-gray-300">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Event Details Modal */}
      {selectedRequest && !showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#191C24', border: '1px solid #ABA8A9' + '30' }}>
            <div className="p-6" style={{ backgroundColor: '#0D6EFD', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">{selectedRequest?.title || 'Event Details'}</h2>
                  <p className="text-white opacity-80">Event Request Details</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#0D6EFD' }}>Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                      <span className="text-sm text-white">{selectedRequest?.date ? new Date(selectedRequest.date).toLocaleDateString() : 'N/A'} at {selectedRequest?.time || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                      <span className="text-sm text-white">{selectedRequest?.venue || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                      <span className="text-sm text-white">{selectedRequest?.expectedAttendees || 0} expected attendees</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" style={{ color: '#CBF83E' }} />
                      <span className="text-sm text-white">${selectedRequest?.ticketPrice || 0} per ticket</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#0D6EFD' }}>Organizer Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-white"><span className="font-medium">Name:</span> {selectedRequest?.organizer || 'N/A'}</p>
                    <p className="text-sm text-white"><span className="font-medium">Email:</span> {selectedRequest?.organizerEmail || 'N/A'}</p>
                    <p className="text-sm text-white"><span className="font-medium">Category:</span> {selectedRequest?.category || 'N/A'}</p>
                    <p className="text-sm text-white"><span className="font-medium">Submitted:</span> {selectedRequest?.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3" style={{ color: '#0D6EFD' }}>Description</h3>
                <p className="text-sm leading-relaxed text-white opacity-80">{selectedRequest?.description || 'No description provided'}</p>
              </div>

              {selectedRequest?.status === 'approved' && selectedRequest?.eventAdmin && (
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#CBF83E' + '20', border: '1px solid #CBF83E' + '30' }}>
                  <h3 className="font-semibold mb-3" style={{ color: '#CBF83E' }}>Assigned Staff</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#CBF83E' }}>Event Admin:</p>
                      <p className="text-sm text-white">{selectedRequest.eventAdmin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#CBF83E' }}>Check-in Officers:</p>
                      <p className="text-sm text-white">{selectedRequest.checkinOfficers?.join(', ') || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button 
                  // variant="outline" 
                  onClick={() => setSelectedRequest(null)}
                  className=" text-white bg-gray-700"
                  
                >
                  Close
                </Button>
                {selectedRequest?.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => selectedRequest && handleReject(selectedRequest.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject Request
                    </Button>
                    <Button 
                      onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
                      className="text-black hover:opacity-80"
                      style={{ backgroundColor: '#CBF83E' }}
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
          <div className="rounded-2xl max-w-2xl w-full shadow-2xl" style={{ backgroundColor: '#191C24', border: '1px solid #ABA8A9' + '30' }}>
            <div className="p-6" style={{ backgroundColor: '#AF1763', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
              <h2 className="text-2xl font-bold text-white">Assign Staff</h2>
              <p className="text-white opacity-80">Assign event admin and check-in officers for "{selectedRequest?.title || 'this event'}"</p>
            </div>

            <div className="p-6">
              {/* Event Admin Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3" style={{ color: '#CBF83E' }}>Select Event Admin (1 required)</h3>
                <div className="space-y-2">
                  {staff.filter(s => s.role === 'event_admin' && s.isAvailable).map((staffMember) => (
                    <label key={staffMember.id} className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-700" style={{ borderColor: '#ABA8A9' + '30', backgroundColor: selectedEventAdmin === staffMember.id ? '#CBF83E' + '20' : 'transparent' }}>
                      <input
                        type="radio"
                        name="eventAdmin"
                        value={staffMember.id}
                        checked={selectedEventAdmin === staffMember.id}
                        onChange={(e) => setSelectedEventAdmin(e.target.value)}
                        className="mr-3"
                        style={{ accentColor: '#CBF83E' }}
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#CBF83E' + '30' }}>
                          <Shield className="w-4 h-4" style={{ color: '#CBF83E' }} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{staffMember.displayName || staffMember.name}</p>
                          <p className="text-sm text-white opacity-70">{staffMember.email}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Check-in Officers Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3" style={{ color: '#CBF83E' }}>
                  Select Check-in Officers (2 required) - {selectedCheckinOfficers.length}/2 selected
                </h3>
                <div className="space-y-2">
                  {staff.filter(s => s.role === 'checkin_officer' && s.isAvailable).map((staffMember) => (
                    <label key={staffMember.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCheckinOfficers.includes(staffMember.id) 
                        ? 'border-opacity-60' 
                        : selectedCheckinOfficers.length >= 2
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-700'
                    }`} style={{ 
                      borderColor: selectedCheckinOfficers.includes(staffMember.id) ? '#CBF83E' : '#ABA8A9' + '30',
                      backgroundColor: selectedCheckinOfficers.includes(staffMember.id) ? '#CBF83E' + '20' : 'transparent'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedCheckinOfficers.includes(staffMember.id)}
                        onChange={() => handleCheckinOfficerToggle(staffMember.id)}
                        disabled={selectedCheckinOfficers.length >= 2 && !selectedCheckinOfficers.includes(staffMember.id)}
                        className="mr-3"
                        style={{ accentColor: '#CBF83E' }}
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ABA8A9' + '30' }}>
                          <UserPlus className="w-4 h-4" style={{ color: '#ABA8A9' }} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{staffMember.displayName || staffMember.name}</p>
                          <p className="text-sm text-white opacity-70">{staffMember.email}</p>
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
                  className="border-gray-500 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignStaff}
                  disabled={!selectedEventAdmin || selectedCheckinOfficers.length !== 2}
                  className="text-black hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#CBF83E' }}
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