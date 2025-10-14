"use client"

import { useState, useEffect } from 'react';
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
import { mockEvents } from '@/lib/mock-data';
import { getUserLockedSeats } from '@/lib/api_ticket';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/checkout/PaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Array<{
    id: string;
    section: string;
    row: string;
    number: number;
    price: number;
  }>>([]);
  const [bulkTicketInfo, setBulkTicketInfo] = useState<{
    bulk_ticket_id: number;
    price_per_seat: number;
    seat_type: string;
  } | null>(null);
  
  // Default event data
  const event = mockEvents[0];
  const orderId = 1; // This should come from your order creation logic
  
  // Calculate subtotal based on fetched seats and bulk_ticket_info
  const pricePerSeat = bulkTicketInfo?.price_per_seat || 75; // Default to 75 if no bulk price
  const subtotal = selectedSeats.length * pricePerSeat;
  const serviceFee = 25;
  const total = subtotal + serviceFee;

  // Fetch user's locked seats when the component mounts
  useEffect(() => {
    async function fetchLockedSeats() {
      try {
        setLoading(true);
        const response = await getUserLockedSeats();
        console.log('API response:', response);
        
        // Handle the actual response structure from your backend
        if (response && response.seat_ids && response.seat_ids.length > 0) {
          // Extract bulk ticket info if available
          if (response.bulk_ticket_info?.additionalProp1) {
            const bulkInfo = response.bulk_ticket_info.additionalProp1;
            setBulkTicketInfo({
              bulk_ticket_id: parseInt(response.cart_id, 10) || 1,
              price_per_seat: bulkInfo?.price_per_ticket || 75,
              seat_type: bulkInfo?.seat_type || 'Standard'
            });
            console.log('Bulk ticket info:', response.bulk_ticket_info);
          }
          
          // Transform seat_ids into seat format
          const seatsFromResponse = response.seat_ids.map((seatId: string, index: number) => {
            // Parse seat_id format
            let section = '';
            let row = '';
            let number = 0;
            
            // Try to match patterns like "Orchestra A7" or just "A7"
            if (seatId.includes(' ')) {
              // Format like "Orchestra A7"
              const parts = seatId.split(' ');
              section = parts[0];
              
              if (parts.length > 1) {
                // Extract row and number from the second part (e.g., "A7")
                const rowNumMatch = parts[1].match(/([A-Za-z]+)([0-9]+)$/);
                if (rowNumMatch && rowNumMatch.length > 2) {
                  row = rowNumMatch[1];
                  number = parseInt(rowNumMatch[2], 10);
                }
              }
            } else {
              // Format like "A7" (no space)
              section = 'Orchestra'; // Default section
              const rowNumMatch = seatId.match(/([A-Za-z]+)([0-9]+)$/);
              if (rowNumMatch && rowNumMatch.length > 2) {
                row = rowNumMatch[1];
                number = parseInt(rowNumMatch[2], 10);
              }
            }
            
            // Get price from bulk_ticket_info if available, otherwise use default
            const price = response.bulk_ticket_info?.additionalProp1?.price_per_ticket || 75;
            
            return {
              id: `${response.cart_id}-${index}`,
              section,
              row,
              number,
              price
            };
          });
          
          setSelectedSeats(seatsFromResponse);
        } else {
          console.error('Failed to get locked seats - invalid response format:', response);
        }
      } catch (error) {
        console.error('Error fetching locked seats:', error instanceof Error ? error.message : 'Unknown error');
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    }
    
    fetchLockedSeats();
  }, []);

  const handlePaymentSuccess = () => {
    setOrderComplete(true);
    setPaymentError(null);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (orderComplete) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/15 px-4">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-secondary/20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 h-40 w-40 -translate-y-1/2 rounded-full bg-muted/20 blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
              <Check className="h-9 w-9" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Payment successful</p>
              <h1 className="text-3xl font-bold text-foreground">Order Complete!</h1>
              <p className="text-sm text-muted-foreground">
                Your tickets are on their way to your email. We also saved them in your profile for easy access.
              </p>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-border/60 bg-background/40 p-6 text-left">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Order ID
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary/80">
                  #{orderId.toString().padStart(6, '0')}
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/10 p-3 text-sm text-muted-foreground">
                <Calendar className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">What&apos;s next?</p>
                  <p>Your QR tickets are ready in your profile. Present them at the venue for swift entry.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link href="/profile" className="block">
                <Button className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40">
                  View My Tickets
                </Button>
              </Link>
              <Link href="/events" className="block">
                <Button
                  variant="outline"
                  className="w-full border-primary/40 text-primary transition-colors duration-300 hover:bg-primary/10"
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
                      <Calendar className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
                      {event.date}
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
                    {loading ? (
                      <div style={{ color: '#ABA8A9' }}>Loading your seats...</div>
                    ) : selectedSeats.length > 0 ? (
                      selectedSeats.map(seat => (
                        <div key={seat.id} className="flex items-center justify-between text-sm">
                          <span style={{ color: '#ABA8A9' }}>
                            {/* Only show section name once, then row and number */}
                            {seat.section === 'Orchestra' ? '' : `${seat.section} `}{seat.row}{seat.number}
                          </span>
                          <span style={{ color: '#CBF83E' }}>LKR {pricePerSeat}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#ABA8A9' }}>No seats selected</div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-6">
                  {bulkTicketInfo && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#ABA8A9' }}>Seat Type</span>
                      <span style={{ color: '#fff' }}>{bulkTicketInfo.seat_type}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#ABA8A9' }}>Subtotal</span>
                    <span style={{ color: '#fff' }}>{loading ? 'Calculating...' : `LKR ${subtotal}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="text-muted-foreground">LKR {serviceFee}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-lg border-t pt-2" style={{ borderColor: '#0D6EFD' + '30' }}>
                    <span style={{ color: '#fff' }}>Total</span>
                    <span style={{ color: '#CBF83E' }}>{loading ? 'Calculating...' : `LKR ${total}`}</span>
                  </div>
                </div>

                {/* Payment Error Display */}
                {paymentError && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#ef4444' + '20', borderColor: '#ef4444' + '50' }}>
                    <p className="text-sm" style={{ color: '#ef4444' }}>
                      {paymentError}
                    </p>
                  </div>
                )}

                {/* Payment Form */}
                <Elements stripe={stripePromise}>
                  <PaymentForm 
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </Elements>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
