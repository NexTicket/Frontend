'use client'

import React,{ useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, Calendar, MapPin, QrCode, Download } from 'lucide-react'
import { getUserTicketsUnified } from '@/lib/unified-api'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'

interface UserTicket {
  id: number;
  orderId: number;
  bulkTicketId: number;
  firebaseUid: string;
  seatId: string;
  pricePaid: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED';
  qrCodeData: string;
  createdAt: string;
  order?: {
    id: number;
    orderReference: string;
    status: string;
  };
  bulkTicket?: {
    id: number;
    eventId: number;
    venueId: number;
    seatType: 'VIP' | 'REGULAR';
    price: number;
    totalSeats: number;
    availableSeats: number;
    seatPrefix: string;
    event?: {
      id: number;
      title: string;
      description: string;
      startDate: string;
      status: string;
    };
    venue?: {
      id: number;
      name: string;
      location: string;
      capacity: number;
    };
  };
}

export default function MyTicketsPage() {
  const searchParams = useSearchParams()
  const orderFilter = searchParams.get('order')
  const { firebaseUser } = useAuth()
  
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketServiceUserId, setTicketServiceUserId] = useState<string | null>(null)

  useEffect(() => {
    if (firebaseUser) {
      initializeUser()
    } else {
      setLoading(false)
      setError('Please log in to view your tickets')
    }
  }, [firebaseUser])

  const initializeUser = async () => {
    try {
      if (firebaseUser?.uid) {
        setTicketServiceUserId(firebaseUser.uid) // Use Firebase UID directly
        loadTickets(firebaseUser.uid)
      } else {
        setError('Please log in to view your tickets.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
      setError('Failed to load tickets')
      setLoading(false)
    }
  }

  const loadTickets = async (firebaseUid: string) => {
    try {
      setLoading(true)
      
      // Load user tickets using unified API
      const userTickets = await getUserTicketsUnified(firebaseUid)
      
      // Filter by order if specified
      const filteredTickets = orderFilter 
        ? userTickets.filter((ticket: UserTicket) => ticket.orderId === Number(orderFilter))
        : userTickets
      
      // Tickets are already enriched with event/venue data from unified API
      setTickets(filteredTickets)
    } catch (err) {
      console.error('Failed to load tickets:', err)
      setError('Failed to load tickets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = (ticket: UserTicket) => {
    // Generate QR code and download
    // For now, we'll just show an alert with the QR data
    alert(`QR Code Data: ${ticket.qrCodeData}`)
  }

  const getStatusVariant = (status: UserTicket['status']) => {
    switch (status) {
      case 'SOLD':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-lg">Loading your tickets...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          {!firebaseUser && (
            <Link href="/auth/login">
              <Button>Log In</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="w-6 h-6" />
        <h1 className="text-3xl font-bold">
          My Tickets
          {orderFilter && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              (Order #{orderFilter})
            </span>
          )}
        </h1>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <div className="text-xl text-gray-500 mb-4">No tickets found</div>
          <p className="text-gray-500 mb-6">
            {orderFilter 
              ? 'This order contains no tickets yet.'
              : 'You don\'t have any tickets yet.'
            }
          </p>
          <Link href="/tickets">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => {
            const { date, time } = ticket.bulkTicket?.event ? 
              formatEventDate(ticket.bulkTicket.event.startDate) : 
              { date: '', time: '' }
            
            return (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {ticket.bulkTicket?.event?.title || 'Event'}
                    </CardTitle>
                    <Badge variant={getStatusVariant(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{date} at {time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">
                        {ticket.bulkTicket?.venue?.name || `Venue ID: ${ticket.bulkTicket?.venueId}`}
                      </span>
                    </div>
                    
                    {ticket.bulkTicket?.venue?.location && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {ticket.bulkTicket.venue.location}
                      </p>
                    )}
                  </div>
                  
                  {/* Ticket Details */}
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Seat:</span>
                      <Badge variant="outline">{ticket.seatId}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant={ticket.bulkTicket?.seatType === 'VIP' ? 'default' : 'secondary'}>
                        {ticket.bulkTicket?.seatType || 'Standard'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Price Paid:</span>
                      <span className="font-semibold">${ticket.pricePaid.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {ticket.status === 'SOLD' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadQR(ticket)}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.print()}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Ticket ID */}
                  <p className="text-xs text-gray-400 text-center border-t pt-2">
                    Ticket #{ticket.id}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
      {!orderFilter && tickets.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/tickets/orders">
            <Button variant="outline">
              View All Orders
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}