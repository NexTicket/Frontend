"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  Download,
  Share2,
  Star,
  Settings,
  Heart,
  History
} from 'lucide-react';
import { mockEvents, mockTickets } from '@/lib/mock-data';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    memberSince: '2023-01-15',
    totalEvents: 12,
    totalSpent: 1250
  };

  const userTickets = mockTickets.map(ticket => ({
    ...ticket,
    event: mockEvents.find(e => e.id === ticket.eventId)!
  }));

  const favoriteEvents = mockEvents.slice(0, 3);
  const recentlyViewed = mockEvents.slice(3, 6);

  const tabs = [
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.memberSince).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{user.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">${user.totalSpent}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Tickets</h2>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
                
                {userTickets.length > 0 ? (
                  <div className="space-y-4">
                    {userTickets.map(ticket => (
                      <div key={ticket.id} className="bg-card rounded-lg border p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold">{ticket.event.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                ticket.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : ticket.status === 'used'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(ticket.event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                {ticket.event.time}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2" />
                                {ticket.event.venue}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Purchased: </span>
                                <span>{new Date(ticket.purchaseDate).toLocaleDateString()}</span>
                                <span className="text-muted-foreground ml-4">Price: </span>
                                <span className="font-medium">${ticket.price}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't purchased any tickets yet. Start exploring events!
                    </p>
                    <Link href="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Favorite Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteEvents.map(event => (
                    <div key={event.id} className="bg-card rounded-lg border p-6">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.venue}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${event.price}</span>
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Recently Viewed</h2>
                <div className="space-y-4">
                  {recentlyViewed.map(event => (
                    <div key={event.id} className="bg-card rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.venue}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">${event.price}</p>
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm">View Again</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Account Settings</h2>
                
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue="John"
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive event updates and promotions
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Event Reminders</h4>
                        <p className="text-sm text-muted-foreground">
                          Get reminded about upcoming events
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional offers and deals
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Security</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Enable Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/venues">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="mr-2 h-4 w-4" />
                    Find Venues
                  </Button>
                </Link>
                <Link href="/organizer/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Become Organizer
                  </Button>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Account Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Level</span>
                    <span className="font-medium">Silver</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Points</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next Reward</span>
                    <span className="font-medium">Gold (500 pts)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
