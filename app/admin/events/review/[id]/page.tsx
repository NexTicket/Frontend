'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchEventById, approveEvent, rejectEvent, fetchFirebaseUsers } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft,
  Check,
  X,
  UserPlus,
  Shield,
  AlertCircle,
  Image as ImageIcon,
  Tag,
  Building,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

export default function EventReviewPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eventAdmins, setEventAdmins] = useState<any[]>([]);
  const [checkinOfficers, setCheckinOfficers] = useState<any[]>([]);
  const [selectedEventAdmin, setSelectedEventAdmin] = useState<string>('');
  const [selectedCheckinOfficers, setSelectedCheckinOfficers] = useState<string[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadEventAndStaff = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await fetchEventById(eventId);
        const eventData = eventResponse?.data || eventResponse;
        console.log('📥 Loaded event:', eventData);
        setEvent(eventData);
        
        // Fetch event admins
        const eventAdminResponse = await fetchFirebaseUsers('event_admin');
        const admins = eventAdminResponse?.data || [];
        console.log('📥 Loaded event admins:', admins.length);
        setEventAdmins(admins);
        
        // Fetch checkin officers
        const checkinOfficerResponse = await fetchFirebaseUsers('checkin_officer');
        const officers = checkinOfficerResponse?.data || [];
        
        // Remove duplicates if any
        const uniqueOfficers = officers.filter((officer: any, index: number, self: any[]) =>
          index === self.findIndex((o: any) => o.uid === officer.uid)
        );
        console.log('📥 Loaded checkin officers:', uniqueOfficers.length);
        setCheckinOfficers(uniqueOfficers);
        
      } catch (error: any) {
        console.error('❌ Failed to load event details:', error);
        alert(error.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    loadEventAndStaff();
  }, [eventId]);

  const handleApprove = () => {
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    try {
      setActionLoading(true);
      
      await approveEvent(event.id, {
        venueId: event.venueId,
        eventAdminUid: selectedEventAdmin || undefined,
        checkinOfficerUids: selectedCheckinOfficers
      });

      alert("Event approved successfully with staff assignments");
      router.push('/admin/events');
    } catch (error: any) {
      console.error('❌ Failed to approve event:', error);
      alert(error.message || "Failed to approve event");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this event?')) return;

    try {
      setActionLoading(true);
      
      await rejectEvent(event.id);

      alert("Event rejected successfully");
      router.push('/admin/events');
    } catch (error: any) {
      console.error('❌ Failed to reject event:', error);
      alert(error.message || "Failed to reject event");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCheckinOfficer = (uid: string) => {
    setSelectedCheckinOfficers(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
        <Button onClick={() => router.push('/admin/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/events')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Review Event</h1>
              <p className="text-muted-foreground mt-1">
                Review event details and assign staff before approval
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
              event.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}>
              {event.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border p-6"
            >
              {event.image ? (
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-primary/40" />
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
              <p className="text-muted-foreground">{event.description}</p>
              
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{event.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{event.type}</span>
                </div>
              </div>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-lg border p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {event.endDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {new Date(event.endDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {event.startTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Time</p>
                      <p className="font-medium">{event.startTime}</p>
                    </div>
                  </div>
                )}

                {event.endTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Time</p>
                      <p className="font-medium">{event.endTime}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Venue Details */}
            {event.venue && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-lg border p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Venue Name</p>
                      <p className="font-medium">{event.venue.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{event.venue.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{event.venue.capacity?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>

                  {event.venue.type && (
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Venue Type</p>
                        <p className="font-medium">{event.venue.type}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Organizer Details */}
            {event.Tenant && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-lg border p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Organizer Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Organizer Name</p>
                      <p className="font-medium">{event.Tenant.name || 'N/A'}</p>
                    </div>
                  </div>

                  {event.Tenant.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{event.Tenant.email}</p>
                      </div>
                    </div>
                  )}

                  {event.Tenant.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{event.Tenant.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-lg border p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                
                {event.status === 'PENDING' ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleApprove}
                      className="w-full"
                      disabled={actionLoading}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Event
                    </Button>
                    
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="w-full"
                      disabled={actionLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Event
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      This event has already been {event.status.toLowerCase()}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Review Guidelines
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>Verify event details are complete</li>
                      <li>Confirm venue availability</li>
                      <li>Assign staff when approving</li>
                      <li>Check organizer credentials</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !actionLoading && setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Assign Staff</h3>
                      <p className="text-sm text-muted-foreground">
                        Assign staff members to manage this event
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApprovalModal(false)}
                    disabled={actionLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Event Admin Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <label className="font-medium">Event Admin (Optional)</label>
                    </div>
                    <select
                      value={selectedEventAdmin}
                      onChange={(e) => setSelectedEventAdmin(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={actionLoading}
                    >
                      <option value="">No Event Admin</option>
                      {eventAdmins.map((admin) => (
                        <option key={admin.uid} value={admin.uid}>
                          {admin.displayName || admin.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Check-in Officers Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <label className="font-medium">Check-in Officers</label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedCheckinOfficers.length} selected
                      </span>
                    </div>
                    
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {checkinOfficers.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          No check-in officers available
                        </p>
                      ) : (
                        <div className="divide-y">
                          {checkinOfficers.map((officer) => (
                            <label
                              key={officer.uid}
                              className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCheckinOfficers.includes(officer.uid)}
                                onChange={() => toggleCheckinOfficer(officer.uid)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                disabled={actionLoading}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {officer.displayName || officer.email}
                                </p>
                                {officer.email && officer.displayName && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {officer.email}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1"
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmApproval}
                    className="flex-1"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Approval
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
