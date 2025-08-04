"use client"

import React, { useState, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Tag,
  Edit,
  Eye,
  Settings
} from 'lucide-react';
import { mockEvents, mockSeats } from '@/lib/mock-data';

interface EventViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventViewPage({ params }: EventViewPageProps) {
  const resolvedParams = use(params);
  const event = mockEvents.find(e => e.id === resolvedParams.id);
  const eventSeats = mockSeats.filter(seat => seat.section !== ""); // Get all seats for this event

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Link href="/organizer/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group seats by section and row for display
  const groupedSeats = eventSeats.reduce((acc, seat) => {
    if (!acc[seat.section]) {
      acc[seat.section] = {};
    }
    if (!acc[seat.section][seat.row]) {
      acc[seat.section][seat.row] = [];
    }
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {} as Record<string, Record<string, typeof eventSeats>>);

  // Calculate stats
  const totalSeats = eventSeats.length;
  const availableSeats = eventSeats.filter(seat => seat.isAvailable).length;
  const soldSeats = totalSeats - availableSeats;
  const revenue = eventSeats.filter(seat => !seat.isAvailable).reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/organizer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/organizer/events/${resolvedParams.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-6">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg mb-6 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-primary" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              <p className="text-muted-foreground mb-6">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Event Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">Total Seats</span>
                  </div>
                  <span className="font-medium">{totalSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Available</span>
                  </div>
                  <span className="font-medium">{availableSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Sold</span>
                  </div>
                  <span className="font-medium">{soldSeats}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">Revenue</span>
                  </div>
                  <span className="font-medium">${revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href={`/organizer/events/${resolvedParams.id}/edit`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event Details
                  </Button>
                </Link>
                <Link href={`/organizer/events/${resolvedParams.id}/seating-edit`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Seating Layout
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Sales Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Seating Arrangement View */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-6">Seating Arrangement</h2>
          
          {/* Stage */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 mb-8 text-center">
            <h3 className="text-lg font-semibold text-primary">STAGE</h3>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Sold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-muted-foreground">VIP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Box Seats</span>
            </div>
          </div>

          {/* Seating Sections */}
          <div className="space-y-8">
            {Object.entries(groupedSeats).map(([section, rows]) => (
              <div key={section} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">{section}</h3>
                <div className="space-y-2">
                  {Object.entries(rows).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center justify-center space-x-1">
                      <span className="text-sm text-muted-foreground w-8 text-center">{row}</span>
                      {rowSeats.map(seat => {
                        let seatClass = "w-8 h-8 rounded text-xs font-medium flex items-center justify-center ";
                        
                        // Determine seat type and color
                        if (section.includes("VIP")) {
                          seatClass += seat.isAvailable ? "bg-yellow-500 text-white" : "bg-yellow-700 text-white";
                        } else if (section.includes("Box")) {
                          seatClass += seat.isAvailable ? "bg-purple-500 text-white w-12" : "bg-purple-700 text-white w-12";
                        } else {
                          seatClass += seat.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white";
                        }

                        return (
                          <div
                            key={seat.id}
                            className={seatClass}
                            title={`${section} ${row}${seat.number} - $${seat.price} - ${seat.isAvailable ? 'Available' : 'Sold'}`}
                          >
                            {seat.number}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Pricing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Regular Seats: </span>
                <span className="text-muted-foreground">$50 - $100</span>
              </div>
              <div>
                <span className="font-medium">VIP Seats: </span>
                <span className="text-muted-foreground">$150 - $200</span>
              </div>
              <div>
                <span className="font-medium">Box Seats: </span>
                <span className="text-muted-foreground">$300 - $500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
