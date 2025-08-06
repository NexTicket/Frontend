"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  X, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Tag,
  User,
  Building,
  Settings,
  UserCheck,
  AlertTriangle,
  Send,
  Filter,
  Search,
  MoreVertical,
  MessageSquare,
  Star,
  Shield
} from 'lucide-react';
import { mockVenues } from '@/lib/mock-data';

interface EventRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  endTime: string;
  expectedAttendance: number;
  tags: string[];
  venueId: string;
  venue?: any;
  ticketTypes: Array<{
    name: string;
    price: string;
    description: string;
  }>;
  requestMessage: string;
  requiredStaff: {
    eventAdmins: number;
    checkinOfficers: number;
  };
  specialRequirements: string;
  organizer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

// Mock event requests data
const mockEventRequests: EventRequest[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2025',
    description: 'A comprehensive conference bringing together tech leaders, innovators, and entrepreneurs to discuss the future of technology. Features keynote speakers, panel discussions, networking sessions, and startup pitch competitions.',
    category: 'Technology',
    date: '2025-09-15',
    time: '09:00',
    endTime: '18:00',
    expectedAttendance: 500,
    tags: ['technology', 'innovation', 'networking', 'startups'],
    venueId: '2',
    ticketTypes: [
      { name: 'Early Bird', price: '150', description: 'Limited time offer' },
      { name: 'Standard', price: '200', description: 'Regular admission' },
      { name: 'VIP', price: '350', description: 'Includes networking dinner' }
    ],
    requestMessage: 'We are organizing a premier technology conference that will bring together industry leaders and innovators. This event aims to foster collaboration and showcase cutting-edge technologies. We have confirmed speakers from major tech companies and expect high attendance.',
    requiredStaff: {
      eventAdmins: 2,
      checkinOfficers: 3
    },
    specialRequirements: 'AV equipment for presentations, live streaming setup, networking areas, registration kiosks',
    organizer: {
      id: 'org1',
      name: 'Sarah Chen',
      email: 'sarah@techinnovate.com',
      company: 'TechInnovate Corp'
    },
    submittedAt: '2025-08-01T10:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Summer Jazz Festival',
    description: 'An outdoor jazz festival featuring local and international artists. Three stages with continuous performances, food vendors, and craft beer garden.',
    category: 'Music',
    date: '2025-08-20',
    time: '14:00',
    endTime: '23:00',
    expectedAttendance: 2000,
    tags: ['music', 'jazz', 'outdoor', 'festival'],
    venueId: '4',
    ticketTypes: [
      { name: 'General Admission', price: '75', description: 'Access to all stages' },
      { name: 'VIP', price: '150', description: 'Reserved seating + food vouchers' }
    ],
    requestMessage: 'Annual jazz festival that has been running for 5 years. We have all necessary permits and insurance. Looking to expand this year with more international acts.',
    requiredStaff: {
      eventAdmins: 3,
      checkinOfficers: 4
    },
    specialRequirements: 'Outdoor sound system, security barriers, waste management, food vendor permits',
    organizer: {
      id: 'org2',
      name: 'Michael Rodriguez',
      email: 'mike@jazzfest.org',
      company: 'Jazz Festival Organization'
    },
    submittedAt: '2025-07-25T15:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Charity Gala for Education',
    description: 'Elegant charity gala to raise funds for educational programs in underserved communities. Features silent auction, dinner, and entertainment.',
    category: 'Other',
    date: '2025-10-05',
    time: '18:00',
    endTime: '23:00',
    expectedAttendance: 300,
    tags: ['charity', 'education', 'gala', 'fundraising'],
    venueId: '5',
    ticketTypes: [
      { name: 'Individual', price: '200', description: 'Single ticket' },
      { name: 'Table of 8', price: '1500', description: 'Reserved table' }
    ],
    requestMessage: 'Annual charity event supporting education initiatives. We are a registered 501(c)(3) non-profit with a strong track record of successful events.',
    requiredStaff: {
      eventAdmins: 2,
      checkinOfficers: 2
    },
    specialRequirements: 'Formal dining setup, auction display area, donation processing systems',
    organizer: {
      id: 'org3',
      name: 'Emily Watson',
      email: 'emily@educationfirst.org',
      company: 'Education First Foundation'
    },
    submittedAt: '2025-07-30T09:15:00Z',
    status: 'approved'
  }
];

export default function AdminEvents() {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>(mockEventRequests);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Filter and search requests
  const filteredRequests = eventRequests.filter(request => {
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Add venue information to requests
  useEffect(() => {
    const requestsWithVenues = eventRequests.map(request => ({
      ...request,
      venue: mockVenues.find(venue => venue.id === request.venueId)
    }));
    setEventRequests(requestsWithVenues);
  }, []);

  const handleApprovalAction = (request: EventRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowApprovalModal(true);
    setAdminNotes('');
  };

  const handleSubmitDecision = () => {
    if (!selectedRequest) return;

    const updatedRequests = eventRequests.map(request => 
      request.id === selectedRequest.id 
        ? { 
            ...request, 
            status: (actionType === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected',
            adminNotes: adminNotes
          }
        : request
    );

    setEventRequests(updatedRequests);
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPendingCount = () => eventRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Event Approval Center
              </h1>
              <p className="text-muted-foreground mt-2">
                Review and manage event requests from organizers
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {getPendingCount()} Pending Requests
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, organizers, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Event Requests List */}
        <div className="space-y-6">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{request.description}</p>
                    
                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">{new Date(request.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">{request.time} - {request.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">{request.expectedAttendance} attendees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm">{request.category}</span>
                      </div>
                    </div>

                    {/* Venue Information */}
                    {request.venue && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{request.venue.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          {request.venue.address}, {request.venue.city} • Capacity: {request.venue.capacity.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Organizer Information */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{request.organizer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{request.organizer.company}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {request.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Staff Requirements */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{request.requiredStaff.eventAdmins} Event Admin(s)</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{request.requiredStaff.checkinOfficers} Check-in Officer(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprovalAction(request, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleApprovalAction(request, 'reject')}
                          className="flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Request Message */}
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium mb-1">Organizer Message:</h5>
                      <p className="text-sm text-muted-foreground">{request.requestMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes (if any) */}
                {request.adminNotes && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-4 w-4 text-primary mt-1" />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium mb-1">Admin Notes:</h5>
                        <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No event requests found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Event requests will appear here when organizers submit them.'}
              </p>
            </div>
          )}
        </div>

        {/* Approval/Rejection Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border shadow-xl animate-fadeInScale">
              <div className="text-center mb-4">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                  actionType === 'approve' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {actionType === 'approve' ? 
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" /> :
                    <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                  }
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {actionType === 'approve' ? 'Approve Event Request' : 'Reject Event Request'}
                </h3>
                <p className="text-muted-foreground">
                  {selectedRequest.title}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="adminNotes" className="block text-sm font-medium mb-2">
                  {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary"
                  placeholder={actionType === 'approve' 
                    ? 'Add any notes for the organizer...'
                    : 'Please provide a reason for rejection...'}
                  required={actionType === 'reject'}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitDecision}
                  disabled={actionType === 'reject' && !adminNotes.trim()}
                  className={`flex-1 ${actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {actionType === 'approve' ? 'Approve Event' : 'Reject Event'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedRequest && !showApprovalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 border shadow-xl animate-fadeInScale max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{selectedRequest.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Event Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Category:</span> {selectedRequest.category}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedRequest.date).toLocaleDateString()}</p>
                      <p><span className="font-medium">Time:</span> {selectedRequest.time} - {selectedRequest.endTime}</p>
                      <p><span className="font-medium">Expected Attendance:</span> {selectedRequest.expectedAttendance}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Ticket Types</h4>
                    <div className="space-y-2">
                      {selectedRequest.ticketTypes.map((ticket, index) => (
                        <div key={index} className="bg-muted/50 p-2 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{ticket.name}</span>
                            <span>${ticket.price}</span>
                          </div>
                          <p className="text-muted-foreground">{ticket.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Organizer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedRequest.organizer.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedRequest.organizer.email}</p>
                      <p><span className="font-medium">Company:</span> {selectedRequest.organizer.company}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Staff Requirements</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Event Admins:</span> {selectedRequest.requiredStaff.eventAdmins}</p>
                      <p><span className="font-medium">Check-in Officers:</span> {selectedRequest.requiredStaff.checkinOfficers}</p>
                    </div>
                  </div>

                  {selectedRequest.specialRequirements && (
                    <div>
                      <h4 className="font-medium mb-2">Special Requirements</h4>
                      <p className="text-sm text-muted-foreground">{selectedRequest.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Request Message</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">{selectedRequest.requestMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}