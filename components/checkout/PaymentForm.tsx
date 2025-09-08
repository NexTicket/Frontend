"use client"

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { createPaymentIntent, completeOrder, updateOrderStatus } from '@/lib/api';

interface PaymentFormProps {
  orderId: number;
  total: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
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

export default function PaymentForm({ orderId, total, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      onPaymentError('Stripe has not loaded yet');
      return;
    }

    setProcessing(true);

    try {
      // Update order status to pending
      await updateOrderStatus(orderId, 'pending');

      // Create payment intent
      const { client_secret } = await createPaymentIntent(total, orderId);

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // Billing details here from form data
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        await updateOrderStatus(orderId, 'failed');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Complete the order
        await completeOrder(orderId, paymentIntent.id);
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      await updateOrderStatus(orderId, 'failed');
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
        disabled={processing || !stripe}
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
            Complete Purchase - LKR {total}
          </>
        )}
      </Button>

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
