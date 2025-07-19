"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Ban,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { mockEvents, mockVenues } from '@/lib/mock-data';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock admin data
  const adminStats = {
    totalUsers: 12500,
    totalEvents: 450,
    totalVenues: 125,
    totalRevenue: 2450000,
    pendingApprovals: 15,
    reportedIssues: 8,
    activeOrganizers: 89,
    systemHealth: 98.5
  };

  const recentEvents = mockEvents.slice(0, 5);
  const recentVenues = mockVenues.slice(0, 3);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'events', label: 'Events' },
    { id: 'venues', label: 'Venues' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: adminStats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Events',
      value: adminStats.totalEvents.toLocaleString(),
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Venues',
      value: adminStats.totalVenues.toLocaleString(),
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'Total Revenue',
      value: `$${(adminStats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Organizer', status: 'Active', joined: '2024-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User', status: 'Suspended', joined: '2024-03-10' },
    { id: 4, name: 'Event Corp', email: 'contact@eventcorp.com', role: 'Organizer', status: 'Pending', joined: '2024-07-15' },
  ];

  const mockReports = [
    { id: 1, type: 'Event', subject: 'Inappropriate Content', reporter: 'user123', status: 'Open' },
    { id: 2, type: 'User', subject: 'Spam Messages', reporter: 'user456', status: 'Resolved' },
    { id: 3, type: 'Venue', subject: 'Incorrect Information', reporter: 'user789', status: 'Open' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Alert Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <h3 className="font-medium text-orange-800">Attention Required</h3>
              <p className="text-sm text-orange-700">
                {adminStats.pendingApprovals} pending approvals and {adminStats.reportedIssues} reported issues need review
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change} from last month</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* System Health */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">System Health</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{adminStats.systemHealth}% Uptime</span>
                  </div>
                </div>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">System metrics visualization</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">New venue approved</p>
                      <p className="text-xs text-muted-foreground">Madison Square Garden - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Event reported</p>
                      <p className="text-xs text-muted-foreground">Inappropriate content - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Organizer verified</p>
                      <p className="text-xs text-muted-foreground">Event Corp - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Review Pending Approvals
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Handle Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </div>
              </div>

              {/* System Stats */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">System Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-medium">8,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Online Now</span>
                    <span className="font-medium">423</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Server Load</span>
                    <span className="font-medium">34%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database Size</span>
                    <span className="font-medium">2.3 GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            <div className="bg-card rounded-lg border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All Users</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="px-3 py-2 border rounded-md bg-background text-sm"
                    />
                    <Button variant="outline" size="sm">Filter</Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Name</th>
                        <th className="text-left py-3 font-medium">Email</th>
                        <th className="text-left py-3 font-medium">Role</th>
                        <th className="text-left py-3 font-medium">Status</th>
                        <th className="text-left py-3 font-medium">Joined</th>
                        <th className="text-left py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map(user => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 font-medium">{user.name}</td>
                          <td className="py-3 text-muted-foreground">{user.email}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' :
                              user.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(user.joined).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Event Management</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">Export</Button>
                <Button>Create Event</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map(event => (
                <div key={event.id} className="bg-card rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Approved
                    </span>
                    <span className="text-sm text-muted-foreground">{event.category}</span>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.venue}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.availableTickets} / {event.capacity}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${event.price}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reports & Issues</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">Export</Button>
                <Button>Generate Report</Button>
              </div>
            </div>

            <div className="bg-card rounded-lg border">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
                <div className="space-y-4">
                  {mockReports.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {report.type} • Reported by {report.reporter}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
>>>>>>> f808f3d49384d349d1c8c0d01e37848e7de71e80
