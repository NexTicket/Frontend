'use client'

import React,{ useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users, ShoppingCart, ArrowLeft } from 'lucide-react'
import { 
  getUnifiedEvent,
  getEventTicketsWithDetails,
  addToCartUnified,
  UnifiedEvent,
  TicketServiceBulkTicket,
  UnifiedVenue
} from '@/lib/unified-api'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'

interface SeatSelection {
  bulkTicketId: number;
  quantity: number;
  selectedSeats: string[];
}

export default function EventBookingPage() {
  const params = useParams()
  const eventId = params?.eventId as string
  const router = useRouter()
  const { firebaseUser, userProfile } = useAuth()
  
  const [event, setEvent] = useState<UnifiedEvent | null>(null)
  const [bulkTickets, setBulkTickets] = useState<TicketServiceBulkTicket[]>([])
  const [availableSeats, setAvailableSeats] = useState<{ [bulkTicketId: number]: string[] }>({})
  const [seatSelections, setSeatSelections] = useState<{ [bulkTicketId: number]: SeatSelection }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  useEffect(() => {
    if (eventId) {
      loadEventData()
    }
  }, [eventId])

  const loadEventData = async () => {
    try {
      setLoading(true)
      
      // Load unified event details (includes venue data)
      const eventData = await getUnifiedEvent(Number(eventId))
      if (!eventData) {
        throw new Error('Event not found')
      }
      setEvent(eventData)
      
      // Load bulk tickets with enriched data
      const bulkTicketsData = await getEventTicketsWithDetails(Number(eventId))
      setBulkTickets(bulkTicketsData)
      
      // For now, we'll mock available seats since the ticket service needs updating
      const seatsData: { [bulkTicketId: number]: string[] } = {}
      for (const ticket of bulkTicketsData) {
        // Generate mock seat numbers based on available_seats
        const mockSeats = []
        for (let i = 1; i <= ticket.available_seats; i++) {
          mockSeats.push(`${ticket.seat_prefix}${i}`)
        }
        seatsData[ticket.id] = mockSeats
      }
      setAvailableSeats(seatsData)
      
    } catch (err) {
      console.error('Failed to load event data:', err)
      setError('Failed to load event details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSeatSelect = (bulkTicketId: number, seatId: string) => {
    setSeatSelections(prev => {
      const current = prev[bulkTicketId] || { 
        bulkTicketId, 
        quantity: 0, 
        selectedSeats: [] 
      }
      
      const newSelectedSeats = current.selectedSeats.includes(seatId)
        ? current.selectedSeats.filter(id => id !== seatId)
        : [...current.selectedSeats, seatId]
      
      return {
        ...prev,
        [bulkTicketId]: {
          ...current,
          quantity: newSelectedSeats.length,
          selectedSeats: newSelectedSeats
        }
      }
    })
  }

  const handleAddToCart = async (bulkTicketId: number) => {
    console.log('🛒 handleAddToCart called with bulkTicketId:', bulkTicketId);
    console.log('🔐 firebaseUser:', firebaseUser?.uid);
    
    if (!firebaseUser) {
      alert('Please log in to add tickets to cart')
      router.push('/auth/login')
      return
    }

    const selection = seatSelections[bulkTicketId]
    console.log('🎫 Current selection:', selection);
    
    if (!selection || selection.quantity === 0) {
      alert('Please select at least one seat')
      return
    }

    try {
      setAddingToCart(bulkTicketId)
      console.log('🚀 Starting addToCartUnified call...');
      
      if (!firebaseUser?.uid) {
        alert('Please log in to add items to cart.')
        return
      }
      
      console.log('📝 Calling addToCartUnified with:', {
        firebaseUid: firebaseUser.uid,
        bulkTicketId,
        selectedSeats: selection.selectedSeats,
        quantity: selection.quantity
      });
      
      const result = await addToCartUnified(
        firebaseUser.uid,
        bulkTicketId,
        selection.selectedSeats,
        selection.quantity
      )
      
      console.log('✅ addToCartUnified result:', result);
      alert(`${selection.quantity} ticket(s) added to cart!`)
      
      // Clear selection
      setSeatSelections(prev => ({
        ...prev,
        [bulkTicketId]: { bulkTicketId, quantity: 0, selectedSeats: [] }
      }))
      
    } catch (err) {
      console.error('❌ Failed to add to cart:', err)
      const errorMessage = err instanceof Error ? err.message : 'Please try again.';
      alert(`Failed to add tickets to cart: ${errorMessage}`)
    } finally {
      setAddingToCart(null)
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
          <div className="text-lg">Loading event details...</div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-red-600 text-lg mb-4">{error || 'Event not found'}</div>
          <Link href="/tickets">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { date, time } = formatEventDate(event.startDate)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/tickets" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {date}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {time}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue?.name || `Venue ID: ${event.venue?.id || 'Unknown'}`}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Link href="/tickets/cart">
              <Button variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </Button>
            </Link>
          </div>
        </div>

        {event.venue && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Venue Information</h3>
            <p className="text-sm text-gray-600 mb-1">{event.venue.location || event.venue.address || 'Address not available'}</p>
            <p className="text-sm text-gray-600">Capacity: {event.venue.capacity.toLocaleString()}</p>
            {event.venue.description && (
              <p className="text-sm text-gray-600 mt-2">{event.venue.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Ticket Types */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Select Tickets</h2>
        
        {bulkTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500 mb-4">No tickets available</div>
            <p className="text-gray-500">This event currently has no ticket types available.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {bulkTickets.map((ticket) => {
              const seats = availableSeats[ticket.id] || []
              const selection = seatSelections[ticket.id] || { bulkTicketId: ticket.id, quantity: 0, selectedSeats: [] }
              
              return (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {ticket.seat_type} Tickets
                          <Badge variant={ticket.seat_type === 'VIP' ? 'default' : 'secondary'}>
                            {ticket.seat_type}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          ${ticket.price} per ticket
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold">${ticket.price}</div>
                        <div className="text-gray-500">{ticket.available_seats} available</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Seat Selection */}
                      <div>
                        <h4 className="font-medium mb-2">Available Seats:</h4>
                        {seats.length === 0 ? (
                          <div className="text-gray-500">No seats available</div>
                        ) : (
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {seats.map((seatId) => {
                              const isSelected = selection.selectedSeats.includes(seatId)
                              return (
                                <button
                                  key={seatId}
                                  onClick={() => handleSeatSelect(ticket.id, seatId)}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {seatId}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Selection Summary */}
                      {selection.quantity > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {selection.quantity} ticket(s) selected
                              </div>
                              <div className="text-sm text-gray-600">
                                Seats: {selection.selectedSeats.join(', ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ${(ticket.price * selection.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Add to Cart Button */}
                      <Button 
                        className="w-full" 
                        onClick={() => handleAddToCart(ticket.id)}
                        disabled={
                          selection.quantity === 0 || 
                          addingToCart === ticket.id || 
                          !firebaseUser
                        }
                      >
                        {!firebaseUser ? 'Login to Book' :
                         addingToCart === ticket.id ? 'Adding...' :
                         selection.quantity === 0 ? 'Select Seats First' :
                         `Add ${selection.quantity} Ticket(s) to Cart`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}