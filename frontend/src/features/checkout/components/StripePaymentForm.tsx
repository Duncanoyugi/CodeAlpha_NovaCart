import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, Shield } from 'lucide-react';
import { useCreatePaymentIntentMutation, useConfirmPaymentMutation } from '../../payments/api/paymentApi';
import toast from 'react-hot-toast';

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
  onProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [confirmPayment] = useConfirmPaymentMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not initialized');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setIsLoading(true);
    onProcessing(true);

    try {
      // Step 1: Create Payment Intent
      const intentResult = await createPaymentIntent({ order_id: orderId }).unwrap();
      
      if (!intentResult.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm Payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentResult.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // Optional: Add billing details from form
          },
        },
      });

      if (error) {
        // Payment failed - do NOT call backend success confirmation.
        toast.error(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');

        // If you later add a dedicated "confirmPaymentFailure" endpoint,
        // call it here. For now we leave the backend order state unchanged.
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        toast.success('Payment successful!');
        await confirmPayment({ payment_intent_id: paymentIntent.id }).unwrap();
        onSuccess();
      }
    } catch (error: any) {
      // Avoid leaking full error objects to the console.
      const message = typeof error?.message === 'string' ? error.message : 'Payment processing failed';
      toast.error(message);
      onError(message);

    } finally {
      setIsLoading(false);
      onProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition">
          <CardElement
            options={cardElementOptions}
            onChange={(event) => {
              setCardComplete(event.complete);
              if (event.error) {
                onError(event.error.message);
              } else {
                onError('');
              }
            }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <span>Visa • Mastercard • Amex</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Secure payment</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="text-xs text-gray-600">
          <p className="font-medium">Your payment is secure</p>
          <p>We use Stripe to securely process your payment. Your card details never touch our servers.</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !cardComplete || isLoading}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};