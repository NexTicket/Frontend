"use client"

import React,{ useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  Calendar,
  MapPin,
  Users,
  Clock,
  Check,
  ShoppingCart
} from 'lucide-react';
import { mockEvents, mockSeats } from '@/lib/mock-data';
import { motion } from 'framer-motion';

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Mock selected seats and event (in a real app, this would come from state/context)
  const selectedSeats = mockSeats.filter(s => s.isSelected).slice(0, 2);
  const event = mockEvents[0];
  
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = 5;
  const total = subtotal + serviceFee;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setOrderComplete(true);
    }, 2000);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-muted/50"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center relative z-10"
        >
          <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-xl bg-card border-border">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/20">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">Order Complete!</h1>
            <p className="mb-6 text-muted-foreground">
              Your tickets have been sent to your email address.
            </p>
            <div className="space-y-3">
              <Link href="/profile">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  View My Tickets
                </Button>
              </Link>
              <Link href="/events">
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Browse More Events
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-accent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-muted"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link 
              href="/events" 
              className="inline-flex items-center mb-4 transition-colors duration-200 hover:opacity-80 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Complete your ticket purchase</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Contact Information */}
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Payment Method</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 focus:ring-2 accent-primary"
                    />
                    <label htmlFor="card" className="flex items-center space-x-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span>Credit or Debit Card</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="paypal"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 focus:ring-2 accent-primary"
                    />
                    <label htmlFor="paypal" className="flex items-center space-x-2 text-muted-foreground">
                      <div className="w-4 h-4 rounded-sm bg-blue-600"></div>
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">Card Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Expiry Date</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">CVV</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">Name on Card</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Address */}
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl bg-card border-border">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Billing Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Address</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">City</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">ZIP Code</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 bg-background text-foreground border-border focus:ring-primary/50 placeholder:text-muted-foreground"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl sticky top-8 bg-card border-border">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Order Summary</h3>
                
                {/* Event Details */}
                <div className="border-b pb-4 mb-4 border-border">
                  <h4 className="font-medium mb-2 text-foreground">{event.title}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {event.venue}
                    </div>
                  </div>
                </div>

                {/* Selected Seats */}
                <div className="border-b pb-4 mb-4 border-border">
                  <h4 className="font-medium mb-2 text-foreground">Selected Seats</h4>
                  <div className="space-y-2">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{seat.section} {seat.row}{seat.number}</span>
                        <span className="text-primary font-medium">LKR {seat.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">LKR {subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="text-muted-foreground">LKR {serviceFee}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-lg border-t pt-2 border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary font-semibold">LKR {total}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button 
                  onClick={handlePayment}
                  className="w-full text-white hover:opacity-90 transition-opacity" 
                  size="lg"
                  disabled={processing}
                  style={{ background: '#0D6EFD' }}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      
                      Complete Purchase
                    </>
                  )}
                </Button>

                {/* Security Note */}
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#39FD48' + '10' }}>
                  <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
                    <Lock className="h-4 w-4 mr-2" style={{ color: '#39FD48' }} />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
