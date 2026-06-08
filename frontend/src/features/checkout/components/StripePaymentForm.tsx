import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { useCreatePaymentIntentMutation, useConfirmPaymentMutation } from '../../payments/api/paymentApi';
import { Button } from '../../../components/common/Button';
import toast from 'react-hot-toast';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: 'var(--color-text-primary)',
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      '::placeholder': { color: 'var(--color-text-tertiary)' },
    },
    invalid: { color: 'var(--color-danger-text)', iconColor: 'var(--color-danger-text)' },
  },
};

export const StripePaymentForm: React.FC<{
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}> = ({ orderId, amount, onSuccess, onError, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [confirmPayment] = useConfirmPaymentMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setIsLoading(true);
    onProcessing(true);

    try {
      const { client_secret } = await createPaymentIntent({ order_id: orderId }).unwrap();
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        await confirmPayment({ payment_intent_id: paymentIntent.id }).unwrap();
        onSuccess();
      }
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Payment processing failed';
      toast.error(message);
      onError(message);
    } finally {
      setIsLoading(false);
      onProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-3">Card Details</label>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] p-4 focus-within:border-[var(--color-border-focus)] transition-colors">
          <CardElement options={cardElementOptions} onChange={(e) => {
            setCardComplete(e.complete);
            if (e.error) onError(e.error.message); else onError('');
          }} />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)]">
        <ShieldCheck className="w-5 h-5 text-[var(--color-gold-400)]" />
        <p className="font-ui text-xs text-[var(--color-text-secondary)]">Your payment is secured with 256-bit SSL encryption via Stripe.</p>
      </div>

      <Button type="submit" disabled={!stripe || !cardComplete || isLoading} className="w-full h-12 text-sm">
        {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};
