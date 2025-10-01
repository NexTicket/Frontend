'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { getUserOrdersUnified } from '@/lib/unified-api'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'

interface Order {
  id: number;
  firebaseUid: string;
  orderReference: string;
  paymentIntentId?: string;
  stripePaymentId?: string;
  totalAmount: number;
  serviceFee: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  userTickets?: UserTicket[];
  transactions?: Transaction[];
}

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
  bulkTicket?: {
    id: number;
    eventId: number;
    venueId: number;
    seatType: 'VIP' | 'REGULAR';
    price: number;
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

interface Transaction {
  id: number;
  orderId: number;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter()
  const { firebaseUser } = useAuth()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketServiceUserId, setTicketServiceUserId] = useState<string | null>(null)

  useEffect(() => {
    if (firebaseUser) {
      initializeUser()
    } else {
      setLoading(false)
      setError('Please log in to view your orders')
    }
  }, [firebaseUser])

  const initializeUser = async () => {
    try {
      if (firebaseUser?.uid) {
        setTicketServiceUserId(firebaseUser.uid) // Use Firebase UID directly
        loadOrders(firebaseUser.uid)
      } else {
        setError('Please log in to view your orders.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setError('Failed to load orders')
      setLoading(false)
    }
  }

  const loadOrders = async (firebaseUid: string) => {
    try {
      setLoading(true)
      const ordersData = await getUserOrdersUnified(firebaseUid)
      setOrders(ordersData)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'CONFIRMED':
        return 'secondary'
      case 'PENDING':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-lg">Loading orders...</div>
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
        <Receipt className="w-6 h-6" />
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <div className="text-xl text-gray-500 mb-4">No orders found</div>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/tickets">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Order #{order.orderReference}
                      </h3>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Placed on {formatDate(order.createdAt)}
                      </div>
                      {order.completedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Completed on {formatDate(order.completedAt)}
                        </div>
                      )}
                    </div>

                    <div className="text-2xl font-bold text-green-600">
                      ${(order.totalAmount || 0).toFixed(2)}
                      {(order.serviceFee || 0) > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          (includes ${(order.serviceFee || 0).toFixed(2)} service fee)
                        </span>
                      )}
                    </div>

                    {order.notes && (() => {
                      try {
                        const orderDetails = JSON.parse(order.notes);
                        return (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{orderDetails.total_tickets}</span>
                                <span>tickets</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{orderDetails.cart_items_count}</span>
                                <span>events</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium capitalize">{orderDetails.payment_method}</span>
                                <span>payment</span>
                              </div>
                            </div>
                            
                            {orderDetails.items && orderDetails.items.length > 0 && (
                              <div className="space-y-1">
                                {orderDetails.items.slice(0, 2).map((item: any, index: number) => (
                                  <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                    <span className="font-medium">{item.quantity}x {item.seat_type}</span>
                                    <span className="mx-2">•</span>
                                    <span>Event {item.event_id}</span>
                                    <span className="mx-2">•</span>
                                    <span>${item.price.toFixed(2)} each</span>
                                  </div>
                                ))}
                                {orderDetails.items.length > 2 && (
                                  <div className="text-xs text-gray-400 italic">
                                    +{orderDetails.items.length - 2} more items...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      } catch (error) {
                        return (
                          <p className="text-sm text-gray-600 mt-2">{order.notes}</p>
                        );
                      }
                    })()}
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end gap-2">
                    <Link href={`/tickets/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    
                    {order.status === 'COMPLETED' && (
                      <Link href={`/tickets/my-tickets?order=${order.id}`}>
                        <Button variant="secondary" size="sm">
                          View Tickets
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}