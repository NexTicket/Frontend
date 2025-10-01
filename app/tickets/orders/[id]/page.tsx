"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { getUserOrdersUnified } from '@/lib/unified-api';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';

interface Order {
  id: number;
  orderReference: string;
  totalAmount: number;
  serviceFee: number;
  status: string;
  notes?: string;
  createdAt: string;
  userTickets: any[];
}

interface OrderDetails {
  cart_items_count: number;
  total_tickets: number;
  payment_method: string;
  events: Record<string, any>;
  venues: Record<string, any>;
  items: Array<{
    bulk_ticket_id: number;
    seat_type: string;
    price: number;
    quantity: number;
    preferred_seat_ids: string;
    event_id: number;
    venue_id: number;
  }>;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const { firebaseUser, userProfile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseOrderDetails = (notes?: string): OrderDetails | null => {
    if (!notes) return null;
    try {
      return JSON.parse(notes);
    } catch (error) {
      console.error('Failed to parse order notes:', error);
      return null;
    }
  };

  const formatSeatIds = (seatIds: string): string[] => {
    try {
      // The seat IDs are stored as a JSON string within a string
      return JSON.parse(seatIds);
    } catch (error) {
      console.error('Failed to parse seat IDs:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!firebaseUser?.uid || !orderId) return;

      try {
        setLoading(true);
        setError(null);

        // Get all orders and find the specific one
        const allOrders = await getUserOrdersUnified(firebaseUser.uid);
        const specificOrder = allOrders.find((o: Order) => o.id.toString() === orderId);

        if (specificOrder) {
          setOrder(specificOrder);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [firebaseUser?.uid, orderId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <X className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/tickets/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link href="/tickets/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tickets/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order #{order.orderReference}</p>
            </div>
            <Badge className={`px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{order.orderReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={`px-2 py-1 rounded-full border text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">LKR {(order.totalAmount - order.serviceFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee:</span>
                    <span className="font-medium">LKR {order.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>LKR {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                {(() => {
                  const orderDetails = parseOrderDetails(order.notes);
                  if (!orderDetails) {
                    return <p className="text-gray-600 text-sm">{order.notes}</p>;
                  }

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium">Cart Items</div>
                          <div className="text-lg font-semibold text-blue-800">{orderDetails.cart_items_count}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-sm text-green-600 font-medium">Total Tickets</div>
                          <div className="text-lg font-semibold text-green-800">{orderDetails.total_tickets}</div>
                        </div>
                      </div>

                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">Event ID: {item.event_id}</h4>
                              <p className="text-sm text-gray-600">Venue ID: {item.venue_id}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {item.seat_type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <span className="ml-2 font-medium">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Price Each:</span>
                              <span className="ml-2 font-medium">LKR {item.price.toFixed(2)}</span>
                            </div>
                          </div>

                          {item.preferred_seat_ids && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-600 mb-1">Reserved Seats:</div>
                              <div className="flex flex-wrap gap-1">
                                {formatSeatIds(item.preferred_seat_ids).map((seatId, seatIndex) => (
                                  <Badge key={seatIndex} variant="secondary" className="text-xs">
                                    {seatId}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Subtotal:</span>
                              <span className="font-medium">LKR {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium mb-1">Payment Method</div>
                        <div className="text-blue-800 capitalize">{orderDetails.payment_method}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        {order.userTickets && order.userTickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Tickets ({order.userTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.userTickets.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Seat: {ticket.seatId}</p>
                      <p className="text-sm text-gray-600">Price: LKR {ticket.pricePaid}</p>
                      <p className="text-sm text-gray-600">QR Code: {ticket.qrCodeData}</p>
                    </div>
                    <Badge className={`px-2 py-1 rounded-full border text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/tickets/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
          {order.status.toLowerCase() === 'completed' && (
            <Link href={`/tickets/my-tickets?order=${order.id}`}>
              <Button>View My Tickets</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}