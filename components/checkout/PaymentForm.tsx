"use client"

import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Lock, Clock } from 'lucide-react';

interface PaymentFormProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

interface CheckoutData {
  orderId: string;
  clientSecret: string;
  paymentIntentId?: string;
  total: string;
  subtotal?: string;
  serviceFee?: string;
  expiresAt?: string;
  seatCount?: number;
}

const cardElementOptions = {
  style: {
    base: {
      color: '#fff',
      backgroundColor: '#191C24',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#ABA8A9',
      },
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

export default function PaymentForm({ onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [countdown, setCountdown] = useState<string>('5:00');
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60); // 5 minutes in seconds

  // Load checkout data from sessionStorage and start countdown
  useEffect(() => {
    const storedData = sessionStorage.getItem('checkoutData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as CheckoutData;
        setCheckoutData(parsedData);
        
        // Calculate time remaining if expiresAt is available
        if (parsedData.expiresAt) {
          const expiryTime = new Date(parsedData.expiresAt).getTime();
          const now = new Date().getTime();
          const initialTimeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
          setTimeLeft(initialTimeLeft);
        }
      } catch (error) {
        console.error('Failed to parse checkout data:', error);
        onPaymentError('Payment information is missing or invalid. Please try again.');
      }
    } else {
      onPaymentError('No payment information found. Please select seats again.');
    }
  }, [onPaymentError]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onPaymentError('Time expired. Please select seats again.');
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(intervalId);
          onPaymentError('Time expired. Please select seats again.');
          return 0;
        }
        return newTime;
      });

      // Format time for display
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      setCountdown(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onPaymentError]);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      onPaymentError('Stripe has not loaded yet');
      return;
    }

    if (!checkoutData || !checkoutData.clientSecret || !checkoutData.orderId) {
      onPaymentError('Payment information is missing. Please try again.');
      return;
    }

    // Check if time expired
    if (timeLeft <= 0) {
      onPaymentError('Time expired. Please select seats again.');
      return;
    }

    setProcessing(true);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment using the client_secret from checkout data
      const { error, paymentIntent } = await stripe.confirmCardPayment(checkoutData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Clear checkout data from session storage
        sessionStorage.removeItem('checkoutData');
        
        // Call the success callback
        onPaymentSuccess();
        
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Element */}
      <div className="backdrop-blur-xl border rounded-2xl p-6 shadow-xl" 
           style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '30', boxShadow: '0 25px 50px -12px rgba(13, 202, 240, 0.1)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>Payment Details</h3>
        
        <div className="p-4 border rounded-lg" 
             style={{ backgroundColor: '#191C24', borderColor: '#39FD48' + '50' }}>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Payment Button */}
      <Button 
        onClick={handlePayment}
        className="w-full text-white hover:opacity-90 transition-opacity" 
        size="lg"
        disabled={processing || !stripe || !checkoutData}
        style={{ background: '#0D6EFD' }}
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Complete Purchase - LKR {checkoutData?.total || '0.00'}
          </>
        )}
      </Button>
      
      {/* Countdown Timer */}
      <div className="p-3 rounded-lg mb-2" style={{ backgroundColor: '#0D6EFD' + '10' }}>
        <div className="flex items-center justify-center text-sm">
          <Clock className="h-4 w-4 mr-2" style={{ color: '#0D6EFD' }} />
          <span style={{ color: timeLeft < 60 ? '#ef4444' : '#ABA8A9' }}>
            Complete order within <span className="font-bold">{countdown}</span>
          </span>
        </div>
      </div>

      {/* Security Note */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: '#39FD48' + '10' }}>
        <div className="flex items-center text-sm" style={{ color: '#ABA8A9' }}>
          <Lock className="h-4 w-4 mr-2" style={{ color: '#39FD48' }} />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
}
