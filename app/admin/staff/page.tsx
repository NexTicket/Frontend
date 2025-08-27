'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star, 
  UserCheck,
  Search,
  Filter,
  Calendar,
  Mail,
  MapPin,
  Clock,
  Eye,
  Edit3,
  ChevronDown,
  AlertCircle,
  Check,
  X,
  Plus,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  Building2,
  Shield,
  Award,
  UserPlus,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'event_admin' | 'checkin_officer';
  isAvailable: boolean;
  assignedEvents: string[];
  displayName?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: any;
  specializations?: string[];
  rating?: number;
  completedEvents?: number;
  experienceLevel?: 'junior' | 'senior' | 'expert';
  phone?: string;
  certifications?: string[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: string;
  startDate: string;
  endDate: string;
  requiresEventAdmin?: boolean;
  requiresCheckinOfficer?: boolean;
}

// Animation variants
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

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'event_admin' | 'checkin_officer'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Fetch staff data from Firebase
  const fetchStaff = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const staffUsers: StaffMember[] = [];

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
            lastName: userData.lastName,
            createdAt: userData.createdAt,
            specializations: userData.staffProfile?.specializations || [],
            rating: userData.staffProfile?.rating || Math.floor(Math.random() * 2) + 4, // Mock rating 4-5
            completedEvents: userData.staffProfile?.completedEvents || Math.floor(Math.random() * 20),
            experienceLevel: userData.staffProfile?.experienceLevel || ['junior', 'senior', 'expert'][Math.floor(Math.random() * 3)] as 'junior' | 'senior' | 'expert',
            phone: userData.phone || `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            certifications: userData.staffProfile?.certifications || []
          });
        }
      });

      setStaff(staffUsers);
      console.log('Fetched staff:', staffUsers);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Mock events for now - in real app, fetch from your events collection
  const mockEvents: Event[] = [
    { 
      id: 'event-1', 
      title: 'Tech Summit 2024', 
      date: '2024-12-15', 
      startDate: '2024-12-15', 
      endDate: '2024-12-15', 
      venue: 'Convention Center', 
      status: 'approved',
      requiresEventAdmin: true,
      requiresCheckinOfficer: true
    },
    { 
      id: 'event-2', 
      title: 'Music Festival', 
      date: '2024-07-20', 
      startDate: '2024-07-20', 
      endDate: '2024-07-22', 
      venue: 'Central Park', 
      status: 'approved',
      requiresEventAdmin: true,
      requiresCheckinOfficer: true
    },
    { 
      id: 'event-3', 
      title: 'Art Exhibition', 
      date: '2024-08-10', 
      startDate: '2024-08-10', 
      endDate: '2024-08-15', 
      venue: 'Gallery Downtown', 
      status: 'approved',
      requiresEventAdmin: true,
      requiresCheckinOfficer: false
    },
    { 
      id: 'event-4', 
      title: 'Corporate Conference', 
      date: '2024-09-05', 
      startDate: '2024-09-05', 
      endDate: '2024-09-06', 
      venue: 'Business Center', 
      status: 'pending',
      requiresEventAdmin: true,
      requiresCheckinOfficer: true
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStaff();
      setEvents(mockEvents);
      setLoading(false);
    };
    loadData();
  }, []);

  // Toggle staff availability
  const toggleAvailability = async (staffId: string) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        const newAvailability = !staffMember.isAvailable;
        
        await updateDoc(doc(db, 'users', staffId), {
          'staffProfile.isAvailable': newAvailability
        });

        setStaff(prev => prev.map(s => 
          s.id === staffId ? { ...s, isAvailable: newAvailability } : s
        ));

        console.log(`Updated availability for ${staffMember.name}: ${newAvailability}`);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  // Assign multiple events to a staff member
  const assignEventsToStaff = async (staffId: string, eventIds: string[]) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) return;

      // Combine existing assignments with new ones (avoid duplicates)
      const updatedEvents = [...new Set([...staffMember.assignedEvents, ...eventIds])];
      
      await updateDoc(doc(db, 'users', staffId), {
        'staffProfile.assignedEvents': updatedEvents,
        'staffProfile.isAvailable': updatedEvents.length === 0
      });

      setStaff(prev => prev.map(s => 
        s.id === staffId 
          ? { ...s, assignedEvents: updatedEvents, isAvailable: updatedEvents.length === 0 }
          : s
      ));

      console.log(`Assigned events ${eventIds.join(', ')} to ${staffMember.name}`);
      setAssignmentModalOpen(false);
      setSelectedEvents([]);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error assigning events:', error);
      alert('Failed to assign events. Please try again.');
    }
  };

  // Remove event assignment
  const removeEventAssignment = async (staffId: string, eventId: string) => {
    try {
      const staffMember = staff.find(s => s.id === staffId);
      if (!staffMember) return;

      const updatedEvents = staffMember.assignedEvents.filter(id => id !== eventId);
      
      await updateDoc(doc(db, 'users', staffId), {
        'staffProfile.assignedEvents': updatedEvents,
        'staffProfile.isAvailable': updatedEvents.length === 0
      });

      setStaff(prev => prev.map(s => 
        s.id === staffId 
          ? { ...s, assignedEvents: updatedEvents, isAvailable: updatedEvents.length === 0 }
          : s
      ));

      console.log(`Removed event ${eventId} from ${staffMember.name}`);
    } catch (error) {
      console.error('Error removing assignment:', error);
      alert('Failed to remove assignment. Please try again.');
    }
  };

  // Open assignment modal
  const openAssignmentModal = (staffId: string) => {
    const staffMember = staff.find((s: StaffMember) => s.id === staffId);
    if (!staffMember) return;

    setSelectedStaff(staffId);
    setSelectedEvents([]);
    setAssignmentModalOpen(true);
  };

  // Derived values and computed data
  const stats = {
    total: staff.length,
    eventAdmins: staff.filter((s: StaffMember) => s.role === 'event_admin').length,
    checkinOfficers: staff.filter((s: StaffMember) => s.role === 'checkin_officer').length,
    available: staff.filter((s: StaffMember) => s.isAvailable).length,
    busy: staff.filter((s: StaffMember) => !s.isAvailable).length
  };

  const filteredStaff = staff.filter((member: StaffMember) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && member.isAvailable) ||
                               (availabilityFilter === 'busy' && !member.isAvailable);
    return matchesSearch && matchesRole && matchesAvailability;
  });

  const selectedStaffMember = selectedStaff ? staff.find((s: StaffMember) => s.id === selectedStaff) : null;
  const availableEventsForAssignment = events.filter((event: Event) => 
    selectedStaffMember && 
    !selectedStaffMember.assignedEvents.includes(event.id) &&
    ((selectedStaffMember.role === 'event_admin' && event.requiresEventAdmin) ||
     (selectedStaffMember.role === 'checkin_officer' && event.requiresCheckinOfficer))
  );

  // Helper functions
  const getRoleIcon = (role: string) => {
    return role === 'event_admin' ? <Star className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />;
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'event_admin' ? 'Event Admin' : 'Check-in Officer';
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'event_admin' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#191C24' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#D8DFEE' }}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div
              className="w-20 h-20 border-4 border-[#0D6EFD] border-t-[#39FD48] rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.h3 
              className="text-2xl font-bold mt-6 mb-4"
              style={{ color: '#fff' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading Staff Data...
            </motion.h3>
            <p style={{ color: '#ABA8A9' }}>Fetching staff information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#191C24' }}>
      {/* Background Elements */}
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
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12 h-25">
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
                    Staff Management
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-lg font-normal"
                    style={{ color: '#fff' }}
                  >
                    Manage event staff, assignments, and availability • {stats.total} Total Staff
                  </motion.p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex items-center space-x-3"
                >
                  {/* <Button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)' }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button> */}
                  {/* <Button className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button> */}
                </motion.div>
              </div>
            </div>
          </motion.div>
          <div className="flex h-15 justify-end gap-3">
          <Button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
                    style={{ background: 'linear-gradient(135deg, #0D6EFD, #1565C0)' }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
          </div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500" 
                style={{ backgroundColor: '#191C24', borderColor: '#CBF83E' + '50' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-1xl font-medium mb-1" style={{ color: '#fff' }}>Total Staff</p>
                    <p className="text-3xl font-bold" style={{ color: '#fff' }}>{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#39FD48' + '20' }}>
                    <Users className="h-6 w-6" style={{ color: '#CBF83E' }} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500" 
                style={{ backgroundColor: '#191C24', borderColor: '#CBF83E' + '50' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-1xl font-medium mb-1" style={{ color: '#fff' }}>Event Admins</p>
                    <p className="text-3xl font-bold" style={{ color: '#fff' }}>{stats.eventAdmins}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                    <Star className="h-6 w-6" style={{ color: '#CBF83E' }} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500" 
                style={{ backgroundColor: '#191C24', borderColor: '#CBF83E' + '50' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-1xl font-medium mb-1" style={{ color: '#fff' }}>Check-in Officers</p>
                    <p className="text-3xl font-bold" style={{ color: '#fff' }}>{stats.checkinOfficers}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#39FD48' + '20' }}>
                    <UserCheck className="h-6 w-6" style={{ color: '#CBF83E' }} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500" 
                style={{ backgroundColor: '#191C24', borderColor: '#CBF83E' + '50' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-1xl font-medium mb-1" style={{ color: '#fff' }}>Available</p>
                    <p className="text-3xl font-bold" style={{ color: '#fff' }}>{stats.available}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#0D6EFD' + '20' }}>
                    <Activity className="h-6 w-6" style={{ color: '#CBF83E' }} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500" 
                style={{ backgroundColor: '#191C24', borderColor: '#CBF83E' + '50' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-1xl font-medium mb-1" style={{ color: '#fff' }}>Assigned</p>
                    <p className="text-3xl font-bold" style={{ color: '#fff' }}>{stats.busy}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: '#39FD48' + '20' }}>
                    <TrendingUp className="h-6 w-6" style={{ color: '#CBF83E' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
              style={{ backgroundColor: '#191C24', borderColor: '#CBF83E' + '50', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#ABA8A9' }} />
                  <input
                    type="text"
                    placeholder="Search staff by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:border-[#39FD48] transition-all duration-300"
                    style={{ 
                      backgroundColor: '#0D6EFD' + '20', 
                      borderColor: '#0D6EFD' + '30',
                      color: '#fff'
                    }}
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="relative">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                      className="appearance-none px-4 py-3 pr-10 rounded-xl border focus:outline-none focus:border-[#39FD48] transition-all duration-300"
                      style={{ 
                        backgroundColor: '#0D6EFD' + '20', 
                        borderColor: '#0D6EFD' + '30',
                        color: '#fff'
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#191C24' }}>All Roles</option>
                      <option value="event_admin" style={{ backgroundColor: '#191C24' }}>Event Admins</option>
                      <option value="checkin_officer" style={{ backgroundColor: '#191C24' }}>Check-in Officers</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#ABA8A9' }} />
                  </div>

                  <div className="relative">
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
                      className="appearance-none px-4 py-3 pr-10 rounded-xl border focus:outline-none focus:border-[#39FD48] transition-all duration-300"
                      style={{ 
                        backgroundColor: '#0D6EFD' + '20', 
                        borderColor: '#0D6EFD' + '30',
                        color: '#fff'
                      }}
                    >
                      <option value="all" style={{ backgroundColor: '#191C24' }}>All Status</option>
                      <option value="available" style={{ backgroundColor: '#191C24' }}>Available</option>
                      <option value="busy" style={{ backgroundColor: '#191C24' }}>Assigned</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#ABA8A9' }} />
                  </div>
                </div>
                
                <div className="flex items-center px-4 py-2 rounded-xl border text-sm"
                  style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30', color: '#fff' }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Showing {filteredStaff.length} staff members
                </div>
              </div>
            </div>
          </motion.div>

          {/* Staff Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStaff.map((member: StaffMember, index: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    y: -5, 
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  className="group relative backdrop-blur-xl border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
                  style={{ 
                    backgroundColor: '#191C24', 
                    borderColor: '#CBF83E' + '50',
                    boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)'
                  }}
                >
                  {/* Header */}
                  <div className="p-6 border-b" style={{ borderColor: '#39FD48' + '30' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full border bg-blue-200 flex items-center justify-center text-black font-bold text-xl"
                          style={{  borderColor: '#CBF83E' + '50' }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold group-hover:opacity-90 transition-opacity duration-300"
                            style={{ color: '#fff' }}>
                            {member.name}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border mt-2`}
                            style={{ 
                              backgroundColor: member.role === 'event_admin' ? '#0D6EFD' + '20' : '#198754' + '20',
                              borderColor: member.role === 'event_admin' ? '#0D6EFD' : '#198754',
                              color: member.role === 'event_admin' ? '#0D6EFD' : '#198754'
                            }}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1">{getRoleDisplayName(member.role)}</span>
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-[#0D6EFD]/20 rounded-full transition-all duration-300"
                        style={{ color: '#ABA8A9' }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Status and Rating */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border`}
                        style={{ 
                          backgroundColor: member.isAvailable ? '#198754' + '20' : '#666' + '20',
                          borderColor: member.isAvailable ? '#198754' : '#666',
                          color: member.isAvailable ? '#198754' : '#666'
                        }}>
                        {member.isAvailable ? 'Available' : 'Assigned'}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-current" style={{ color: '#FFC107' }} />
                        <span className="text-sm font-bold" style={{ color: '#fff' }}>{member.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                        <Mail className="h-4 w-4 mr-3" style={{ color: '#0D6EFD' }} />
                        <span className="truncate">{member.email}</span>
                      </div>
                      
                      {member.phone && (
                        <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                          <Users className="h-4 w-4 mr-3" style={{ color: '#198754' }} />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-xl border transition-all duration-300"
                        style={{ backgroundColor: '#0D6EFD' + '20', borderColor: '#0D6EFD' + '30' }}>
                        <Calendar className="h-5 w-5 mx-auto mb-2" style={{ color: '#0D6EFD' }} />
                        <p className="text-lg font-bold" style={{ color: '#fff' }}>{member.completedEvents || 0}</p>
                        <p className="text-xs" style={{ color: '#fff' }}>Completed</p>
                      </div>
                      
                      <div className="text-center p-3 rounded-xl border transition-all duration-300"
                        style={{ backgroundColor: '#0D6EFD' + '20', borderColor: '#0D6EFD' + '30' }}>
                        <Activity className="h-5 w-5 mx-auto mb-2" style={{ color: '#0D6EFD' }} />
                        <p className="text-lg font-bold" style={{ color: '#fff' }}>{member.assignedEvents.length}</p>
                        <p className="text-xs" style={{ color: '#fff' }}>Current</p>
                      </div>
                    </div>

                    {/* Assigned Events */}
                    {member.assignedEvents.length > 0 && (
                      <div className="relative overflow-hidden rounded-xl border p-4"
                        style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold" style={{ color: '#fff' }}>Assigned Events</h4>
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{ backgroundColor: '#0D6EFD' + '20', color: '#fff' }}>
                            {member.assignedEvents.length}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {member.assignedEvents.map((eventId, eventIndex) => {
                            const event = events.find((e: Event) => e.id === eventId);
                            return (
                              <div key={eventIndex} className="flex items-center justify-between text-xs p-2 rounded border group hover:shadow-sm transition-all duration-200"
                                style={{ backgroundColor: '#39FD48' + '10', borderColor: '#39FD48' + '20' }}>
                                <div>
                                  <p className="font-medium" style={{ color: '#fff' }}>
                                    {event ? event.title : `Event ${eventId}`}
                                  </p>
                                  <p style={{ color: '#ABA8A9' }}>
                                    {event ? new Date(event.date).toLocaleDateString() : 'Date TBD'}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEventAssignment(member.id, eventId)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto hover:bg-red-500/20"
                                >
                                  <X className="h-3 w-3 text-red-400" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Experience Level */}
                    <div className="flex items-center justify-center p-3 rounded-xl border"
                      style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                      <Award className="h-4 w-4 mr-2" style={{ color: '#fff' }} />
                      <span className="text-sm font-medium capitalize" style={{ color: '#fff' }}>
                        {member.experienceLevel || 'Senior'} Level
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 flex items-center space-x-2">
                    <Button
                      onClick={() => openAssignmentModal(member.id)}
                      className="flex-1 text-white font-semibold py-2 rounded-xl hover:opacity-90 transition-opacity"
                      style={{ background: '#0D6EFD' }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Events
                    </Button>
                    
                    {/* <Button
                      onClick={() => toggleAvailability(member.id)}
                      
                      size="sm"
                      className="] hover:text-white transition-all duration-300" style={{ background: '#0D6EFD' }}
                    >
                      {member.isAvailable ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    
                    <Button 
                       
                      size="sm"
                      className=" hover:text-black transition-all duration-300" style={{ background: '#0D6EFD' }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button> */}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-20">
              <div className="backdrop-blur-xl border rounded-2xl p-16 max-w-2xl mx-auto shadow-xl" 
                style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="relative mb-8">
                    <motion.div
                      className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center"
                      style={{ backgroundColor: '#0D6EFD' + '20', borderColor: '#39FD48' }}
                      animate={{ 
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Users className="h-10 w-10" style={{ color: '#39FD48' }} />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-6" style={{ color: '#fff' }}>
                    {searchTerm || roleFilter !== 'all' || availabilityFilter !== 'all' 
                      ? 'No Matching Staff Members' 
                      : 'No Staff Members Found'
                    }
                  </h3>
                  
                  <p className="mb-10 text-lg leading-relaxed" style={{ color: '#ABA8A9' }}>
                    {searchTerm || roleFilter !== 'all' || availabilityFilter !== 'all' 
                      ? 'Try adjusting your search criteria or filters to find staff members' 
                      : 'No staff members have been assigned roles yet. Add staff to get started.'
                    }
                  </p>
                  
                  {!searchTerm && roleFilter === 'all' && availabilityFilter === 'all' && (
                    <Button className="text-white font-bold px-10 py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}>
                      <UserPlus className="h-6 w-6 mr-3" />
                      Add First Staff Member
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Assignment Modal */}
      {assignmentModalOpen && selectedStaffMember && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setAssignmentModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="backdrop-blur-xl border rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" 
            style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#fff' }}>
                Assign Events to {selectedStaffMember.name}
              </h2>
              <Button
                onClick={() => setAssignmentModalOpen(false)}
                variant="ghost"
                size="sm"
                className="hover:bg-[#0D6EFD]/20 rounded-full"
              >
                <X className="h-5 w-5" style={{ color: '#ABA8A9' }} />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Current Role Info */}
              <div className="p-4 rounded-xl border" style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                <div className="flex items-center space-x-3">
                  {getRoleIcon(selectedStaffMember.role)}
                  <div>
                    <h3 className="font-semibold" style={{ color: '#fff' }}>
                      {getRoleDisplayName(selectedStaffMember.role)}
                    </h3>
                    <p className="text-sm" style={{ color: '#ABA8A9' }}>
                      Currently assigned to {selectedStaffMember.assignedEvents.length} event{selectedStaffMember.assignedEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Events */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>
                  Available Events ({availableEventsForAssignment.length})
                </h3>
                
                {availableEventsForAssignment.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableEventsForAssignment.map((event: Event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedEvents.includes(event.id)
                            ? 'ring-2 ring-[#39FD48] shadow-md'
                            : 'hover:shadow-md'
                        }`}
                        style={{ 
                          backgroundColor: selectedEvents.includes(event.id) 
                            ? '#39FD48' + '20' 
                            : '#0D6EFD' + '10',
                          borderColor: selectedEvents.includes(event.id) 
                            ? '#39FD48' 
                            : '#0D6EFD' + '30'
                        }}
                        onClick={() => {
                          if (selectedEvents.includes(event.id)) {
                            setSelectedEvents(prev => prev.filter(id => id !== event.id));
                          } else {
                            setSelectedEvents(prev => [...prev, event.id]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold" style={{ color: '#fff' }}>{event.title}</h4>
                            <div className="flex items-center space-x-4 text-sm mt-1" style={{ color: '#ABA8A9' }}>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.venue}
                              </span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedEvents.includes(event.id) ? 'border-[#39FD48] bg-[#39FD48]' : 'border-[#ABA8A9]'
                          }`}>
                            {selectedEvents.includes(event.id) && <Check className="h-3 w-3 text-black" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 p-4 rounded-xl border" 
                    style={{ backgroundColor: '#0D6EFD' + '10', borderColor: '#0D6EFD' + '30' }}>
                    <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#ABA8A9' }} />
                    <h4 className="font-semibold mb-2" style={{ color: '#fff' }}>No Available Events</h4>
                    <p className="text-sm" style={{ color: '#ABA8A9' }}>
                      All suitable events are already assigned to this staff member.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={() => setAssignmentModalOpen(false)}
                  variant="outline"
                  className="border-[#ABA8A9] text-[#ABA8A9] hover:bg-[#ABA8A9] hover:text-black transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => assignEventsToStaff(selectedStaff!, selectedEvents)}
                  disabled={selectedEvents.length === 0}
                  className="text-white font-semibold px-6 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #39FD48, #0D6EFD)' }}
                >
                  Assign {selectedEvents.length} Event{selectedEvents.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
