"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { fetchEvents, approveEvent, rejectEvent } from '@/lib/api';

interface EventRequest {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string;
  price: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  type: string | null;
  organizerId: string;
  venue: {
    id: number;
    name: string;
    location: string;
    tenant: {
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'view'>('view');
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch events from EVMS API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // You might want to show a toast notification here
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Filter events based on status and search term
  const filteredEvents = events.filter(event => {
    const statusFilter = selectedStatus === 'all' || event.status.toLowerCase() === selectedStatus;
    const searchFilter = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    return statusFilter && searchFilter;
  });

  const handleAction = async (event: EventRequest, action: 'approve' | 'reject') => {
    setSelectedEvent(event);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedEvent) return;

    try {
      setProcessingAction(true);
      
      if (modalAction === 'approve') {
        await approveEvent(selectedEvent.id.toString());
        setEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, status: 'APPROVED' }
            : event
        ));
      } else if (modalAction === 'reject') {
        await rejectEvent(selectedEvent.id.toString());
        setEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, status: 'REJECTED' }
            : event
        ));
      }

      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error(`Failed to ${modalAction} event:`, error);
      // You might want to show an error toast here
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Event Management</h1>
          <p className="text-muted-foreground">Review and manage event requests from organizers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'PENDING').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'APPROVED').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'REJECTED').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border rounded-lg bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg bg-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-card rounded-lg border p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No event requests have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm border ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                          <span className="capitalize">{event.status.toLowerCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(event, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(event, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEvent(event);
                            setModalAction('view');
                            setShowModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue.tenant.name}</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-muted-foreground mt-3 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {modalAction === 'view' ? 'Event Details' : 
                   modalAction === 'approve' ? 'Approve Event' : 'Reject Event'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{selectedEvent.title}</h3>
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm border ${getStatusColor(selectedEvent.status)}`}>
                    {getStatusIcon(selectedEvent.status)}
                    <span className="capitalize">{selectedEvent.status.toLowerCase()}</span>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Date & Time</h4>
                    <p className="text-muted-foreground">
                      {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Venue</h4>
                    <p className="text-muted-foreground">{selectedEvent.venue.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.venue.location}</p>
                  </div>
                </div>

                {selectedEvent.price && (
                  <div>
                    <h4 className="font-medium mb-2">Ticket Price</h4>
                    <p className="text-muted-foreground">LKR {selectedEvent.price}</p>
                  </div>
                )}

                {modalAction !== 'view' && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">
                      Are you sure you want to {modalAction} this event? This action cannot be undone.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={processingAction}
                  >
                    {modalAction === 'view' ? 'Close' : 'Cancel'}
                  </Button>
                  {modalAction !== 'view' && (
                    <Button
                      onClick={confirmAction}
                      disabled={processingAction}
                      className={modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                      variant={modalAction === 'reject' ? 'destructive' : 'default'}
                    >
                      {processingAction ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : modalAction === 'approve' ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {processingAction ? 'Processing...' : 
                       modalAction === 'approve' ? 'Approve Event' : 'Reject Event'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
