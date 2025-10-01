"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  Calendar,
  MapPin,
  Clock,
  Check,
  Loader2
} from 'lucide-react';
import { 
  getUserCartUnified, 
  createOrderUnified,
  clearUserCartUnified 
} from '@/lib/unified-api';
import { useAuth } from '@/components/auth/auth-provider';

interface CartItem {
  id: number;
  firebaseUid: string;
  bulkTicketId: number;
  preferredSeatIds: string;
  quantity: number;
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
    };
    venue?: {
      id: number;
      name: string;
      location: string;
    };
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  useEffect(() => {
    if (firebaseUser?.uid) {
      loadCart();
    } else {
      setError('Please log in to checkout');
      setLoading(false);
    }
  }, [firebaseUser]);

  const loadCart = async () => {
    try {
      if (!firebaseUser?.uid) return;
      
      const cartData = await getUserCartUnified(firebaseUser.uid);
      setCartItems(cartData.items || []);
      
      if (!cartData.items || cartData.items.length === 0) {
        setError('Your cart is empty');
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.bulkTicket?.price || 0) * item.quantity, 0
    );
    const serviceFee = subtotal * 0.05; // 5% service fee
    return {
      subtotal,
      serviceFee,
      total: subtotal + serviceFee
    };
  };

  const handlePayment = async () => {
    if (!firebaseUser?.uid || !cartItems.length) return;

    try {
      setProcessing(true);
      
      const { total } = calculateTotal();
      
      // Create order with pending status - this will also create tickets and clear cart
      const order = await createOrderUnified(firebaseUser.uid, paymentMethod);
      
      // In a real app, you would integrate with Stripe or another payment processor here
      // For now, we'll simulate a successful payment
      
      // Cart is automatically cleared by the backend after order creation
      
      setOrderId(order.orderReference || order.id.toString());
      setOrderComplete(true);
      
    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPreferredSeats = (preferredSeatsJson: string) => {
    try {
      return JSON.parse(preferredSeatsJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <div>Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <div className="space-y-3">
            <Link href="/tickets/cart">
              <Button className="w-full">Back to Cart</Button>
            </Link>
            <Link href="/tickets">
              <Button variant="outline" className="w-full">Browse Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Card className="p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
            <p className="text-gray-600 mb-4">
              Your order has been placed successfully.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">
                Order ID: {orderId}
              </p>
            )}
            <div className="space-y-3">
              <Link href="/tickets/my-tickets">
                <Button className="w-full">View My Tickets</Button>
              </Link>
              <Link href="/tickets">
                <Button variant="outline" className="w-full">Browse More Events</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const { subtotal, serviceFee, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tickets/cart" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const preferredSeats = getPreferredSeats(item.preferredSeatIds);
                    const { date, time } = item.bulkTicket?.event ? 
                      formatEventDate(item.bulkTicket.event.startDate) : 
                      { date: '', time: '' };
                    
                    return (
                      <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {item.bulkTicket?.event?.title || 'Event'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.bulkTicket?.venue?.name || 'Venue'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {time}
                            </span>
                          </div>
                          <div className="mt-2">
                            <Badge variant={item.bulkTicket?.seatType === 'VIP' ? 'default' : 'secondary'}>
                              {item.bulkTicket?.seatType || 'Unknown'}
                            </Badge>
                            <span className="text-sm text-gray-600 ml-2">
                              Qty: {item.quantity}
                            </span>
                            {preferredSeats.length > 0 && (
                              <span className="text-sm text-gray-600 ml-2">
                                Seats: {preferredSeats.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${((item.bulkTicket?.price || 0) * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${item.bulkTicket?.price || 0} each
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="stripe"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="stripe" className="flex items-center cursor-pointer">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Credit Card (Stripe)
                    </label>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Your payment information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={processing || !cartItems.length}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Complete Order
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  By completing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}