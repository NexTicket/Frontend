'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react'
import { 
  getUserCartUnified, 
  updateCartItemUnified,
  removeFromCartUnified,
  clearUserCartUnified,
  createOrderUnified
} from '@/lib/unified-api'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'

interface CartItem {
  id: number;
  firebaseUid: string;
  bulkTicketId: number;
  preferredSeatIds: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface CartItemWithDetails extends CartItem {
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
      endDate?: string;
      status: string;
    };
    venue?: {
      id: number;
      name: string;
      location: string;
      capacity: number;
      description: string;
    };
  };
}

interface CartSummary {
  total_items: number;
  total_amount: number;
}

export default function CartPage() {
  const router = useRouter()
  const { firebaseUser, userProfile } = useAuth()
  
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<number[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [ticketServiceUserId, setTicketServiceUserId] = useState<string | null>(null)

  useEffect(() => {
    if (firebaseUser) {
      initializeUser()
    } else {
      setLoading(false)
      setError('Please log in to view your cart')
    }
  }, [firebaseUser])

  const initializeUser = async () => {
    try {
      if (firebaseUser?.uid) {
        setTicketServiceUserId(firebaseUser.uid) // Use Firebase UID directly
        loadCart(firebaseUser.uid)
      } else {
        setError('Please log in to view your cart.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setError('Failed to load cart')
      setLoading(false)
    }
  }

  const loadCart = async (firebaseUid: string) => {
    try {
      setLoading(true)
      
      // Load cart items using unified API
      const cartData = await getUserCartUnified(firebaseUid)
      setCartItems(cartData.items || [])
      setCartSummary({
        total_items: cartData.total_items || 0,
        total_amount: cartData.total_amount || 0
      })
      
    } catch (error) {
      console.error('Error loading cart:', error)
      setError('Failed to load cart items. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    if (!ticketServiceUserId) {
      alert('User not properly initialized. Please refresh the page.')
      return
    }
    
    try {
      setUpdatingItems(prev => [...prev, cartItemId])
      
      const item = cartItems.find(item => item.id === cartItemId)
      if (!item) return
      
      const preferredSeats = JSON.parse(item.preferredSeatIds)
      
      // If increasing quantity, we need to handle seat selection differently
      // For now, we'll just update the quantity
      await updateCartItemUnified(cartItemId, {
        quantity: newQuantity,
        preferred_seat_ids: JSON.stringify(preferredSeats.slice(0, newQuantity))
      })
      
      const userId = parseInt(ticketServiceUserId)
      await loadCart(firebaseUser?.uid || '') // Reload cart to get updated data
    } catch (err) {
      console.error('Failed to update cart item:', err)
      alert('Failed to update item quantity. Please try again.')
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== cartItemId))
    }
  }

  const handleRemoveItem = async (cartItemId: number) => {
    if (!ticketServiceUserId) {
      alert('User not properly initialized. Please refresh the page.')
      return
    }
    
    try {
      setUpdatingItems(prev => [...prev, cartItemId])
      await removeFromCartUnified(cartItemId)
      if (firebaseUser?.uid) {
        await loadCart(firebaseUser.uid) // Reload cart
      }
    } catch (err) {
      console.error('Failed to remove cart item:', err)
      alert('Failed to remove item from cart. Please try again.')
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== cartItemId))
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return
    
    if (!ticketServiceUserId) {
      alert('User not properly initialized. Please refresh the page.')
      return
    }
    
    try {
      if (firebaseUser?.uid) {
        await clearUserCartUnified(firebaseUser.uid)
        await loadCart(firebaseUser.uid)
      }
    } catch (err) {
      console.error('Failed to clear cart:', err)
      alert('Failed to clear cart. Please try again.')
    }
  }

  const handleCheckout = async () => {
    if (!cartItems.length) return
    
    if (!ticketServiceUserId) {
      alert('User not properly initialized. Please refresh the page.')
      return
    }
    
    try {
      setCheckingOut(true)
      
      // Create order from cart
      if (firebaseUser?.uid) {
        const order = await createOrderUnified(firebaseUser.uid, 'stripe')
        
        alert(`Order created successfully! Order ID: ${order.id}`)
        
        // Redirect to orders page or payment page
        router.push(`/tickets/orders/${order.id}`)
      }
    } catch (err) {
      console.error('Failed to create order:', err)
      alert('Failed to create order. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getPreferredSeats = (preferredSeatsJson: string) => {
    try {
      return JSON.parse(preferredSeatsJson)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-lg">Loading cart...</div>
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
      <div className="mb-6">
        <Link href="/tickets" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Your Cart</h1>
        {cartSummary && (
          <Badge variant="secondary">
            {cartSummary.total_items} item{cartSummary.total_items !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <div className="text-xl text-gray-500 mb-4">Your cart is empty</div>
          <p className="text-gray-500 mb-6">Add some tickets to get started!</p>
          <Link href="/tickets">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const preferredSeats = getPreferredSeats(item.preferredSeatIds)
              const { date, time } = item.bulkTicket?.event ? formatEventDate(item.bulkTicket.event.startDate) : { date: '', time: '' }
              const isUpdating = updatingItems.includes(item.id)
              
              return (
                <Card key={item.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.bulkTicket?.event?.title || 'Event'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.bulkTicket?.venue?.name || `Venue ID: ${item.bulkTicket?.venueId}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>{date}</span>
                            <span>{time}</span>
                          </div>
                        </div>
                        <Badge variant={item.bulkTicket?.seatType === 'VIP' ? 'default' : 'secondary'}>
                          {item.bulkTicket?.seatType || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Seats: </span>
                          {preferredSeats.length > 0 ? preferredSeats.join(', ') : 'Not specified'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Price per ticket: </span>
                          ${item.bulkTicket?.price || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-lg font-semibold mb-2">
                        ${((item.bulkTicket?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={handleClearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartSummary?.total_items || 0} items):</span>
                  <span>${cartSummary?.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Fee:</span>
                  <span>$0.00</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${cartSummary?.total_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || checkingOut}
                >
                  {checkingOut ? 'Processing...' : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}