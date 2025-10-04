'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loading } from '@/components/ui/loading';
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
  X
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
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: string;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'event_admin' | 'checkin_officer'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');

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
            specializations: userData.staffProfile?.specializations || []
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
    { id: 'event-1', title: 'Tech Summit 2024', date: '2024-12-15', venue: 'Convention Center', status: 'approved' },
    { id: 'event-2', title: 'Music Festival', date: '2024-07-20', venue: 'Central Park', status: 'approved' },
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

  // Filter staff based on search and filters
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && member.isAvailable) ||
                               (availabilityFilter === 'busy' && !member.isAvailable);
    
    return matchesSearch && matchesRole && matchesAvailability;
  });

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

  const getRoleIcon = (role: string) => {
    return role === 'event_admin' ? <Star className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />;
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'event_admin' ? 'Event Admin' : 'Check-in Officer';
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'event_admin' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
  };

  const stats = {
    total: staff.length,
    eventAdmins: staff.filter(s => s.role === 'event_admin').length,
    checkinOfficers: staff.filter(s => s.role === 'checkin_officer').length,
    available: staff.filter(s => s.isAvailable).length,
    busy: staff.filter(s => !s.isAvailable).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <Loading
          size="lg"
          text="Loading staff data..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-orange-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Staff Management</h1>
              <p className="text-purple-100 text-lg">Manage event staff, assignments, and availability</p>
            </div>
          </div>
          
          {/* Quick Stats in Header */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-purple-100">Total Staff</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.eventAdmins}</div>
              <div className="text-sm text-purple-100">Event Admins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.checkinOfficers}</div>
              <div className="text-sm text-purple-100">Check-in Officers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.available}</div>
              <div className="text-sm text-purple-100">Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.busy}</div>
              <div className="text-sm text-purple-100">Assigned</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="event_admin">Event Admins</option>
                  <option value="checkin_officer">Check-in Officers</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Assigned</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Showing {filteredStaff.length} staff members</span>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{getRoleDisplayName(member.role)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    member.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isAvailable ? 'Available' : 'Assigned'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                
                {member.assignedEvents.length > 0 && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">Assigned Events:</div>
                      {member.assignedEvents.map((eventId, index) => {
                        const event = events.find(e => e.id === eventId);
                        return (
                          <div key={index} className="text-xs text-gray-500">
                            {event ? `${event.title} - ${event.date}` : eventId}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  onClick={() => toggleAvailability(member.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {member.isAvailable ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Mark Busy</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Mark Available</span>
                    </>
                  )}
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Found</h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all' || availabilityFilter !== 'all' 
                ? 'No staff members match your current filters.' 
                : 'No staff members have been assigned roles yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
