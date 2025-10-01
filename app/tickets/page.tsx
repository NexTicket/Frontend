'use client'

import React,{ useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users, Plus } from 'lucide-react'
import { getUnifiedEvents, getEventTicketsWithDetails, UnifiedEvent, TicketServiceBulkTicket } from '@/lib/unified-api'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'

export default function TicketsPage() {
  const [events, setEvents] = useState<UnifiedEvent[]>([])
  const [bulkTickets, setBulkTickets] = useState<{ [eventId: number]: TicketServiceBulkTicket[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { firebaseUser } = useAuth()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const eventsData = await getUnifiedEvents()
      setEvents(eventsData)
      
      // Load bulk tickets for each event
      const bulkTicketsData: { [eventId: number]: TicketServiceBulkTicket[] } = {}
      for (const event of eventsData) {
        // Skip events without valid IDs
        if (!event.id || typeof event.id !== 'number') {
          console.warn('Event missing valid ID:', event)
          continue
        }
        
        try {
          const eventBulkTickets = await getEventTicketsWithDetails(event.id)
          bulkTicketsData[event.id] = eventBulkTickets
        } catch (err) {
          console.error(`Failed to load bulk tickets for event ${event.id}:`, err)
          bulkTicketsData[event.id] = []
        }
      }
      setBulkTickets(bulkTicketsData)
    } catch (err) {
      console.error('Failed to load events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getTotalAvailableSeats = (eventId: number) => {
    if (!eventId || typeof eventId !== 'number') return 0
    const eventTickets = bulkTickets[eventId] || []
    return eventTickets.reduce((total, ticket) => total + ticket.available_seats, 0)
  }

  const getMinPrice = (eventId: number) => {
    if (!eventId || typeof eventId !== 'number') return null
    const eventTickets = bulkTickets[eventId] || []
    if (eventTickets.length === 0) return null
    return Math.min(...eventTickets.map(ticket => ticket.price))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-lg">Loading events...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={loadEvents}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Available Events</h1>
          <p className="text-muted-foreground mt-2">Book tickets for upcoming events</p>
        </div>
        {firebaseUser && (
          <Link href="/tickets/my-tickets">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              My Tickets
            </Button>
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-xl text-muted-foreground mb-4">No events available</div>
          <p className="text-muted-foreground">Check back later for new events!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events
            .filter((event) => event.id && typeof event.id === 'number')
            .map((event) => {
            const { date, time } = formatEventDate(event.startDate)
            const availableSeats = getTotalAvailableSeats(event.id)
            const minPrice = getMinPrice(event.id)
            const eventTickets = bulkTickets[event.id] || []

            return (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {event.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {date}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {time}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.venue?.name || `Venue ID: ${event.venue?.id || 'Unknown'}`}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {availableSeats} seats available
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {eventTickets.map((ticket) => (
                        <Badge 
                          key={ticket.id} 
                          variant={ticket.seat_type === 'VIP' ? 'default' : 'secondary'}
                        >
                          {ticket.seat_type}: ${ticket.price}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center">
                  <div className="flex flex-col">
                    {minPrice && (
                      <span className="text-lg font-semibold">From ${minPrice}</span>
                    )}
                  </div>
                  <Link href={`/tickets/${event.id}`}>
                    <Button disabled={availableSeats === 0}>
                      {availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}