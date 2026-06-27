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
      if (!client_secret || typeof client_secret !== 'string') {
        toast.error('Stripe payment initialization failed (missing client secret). Check your internet/DNS connection to Stripe.');
        onError('Stripe payment initialization failed (missing client secret)');
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card },
      });


      if (error) {
        toast.error(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (!paymentIntent) {
        toast.error('Payment failed: missing payment intent');
        onError('Payment failed: missing payment intent');
      } else if (paymentIntent.status === 'requires_action') {
        // Next step (3D Secure / other authentication)
        const { error: actionError, paymentIntent: actionResult } = await stripe.confirmCardPayment(
          client_secret
        );

        if (actionError) {
          toast.error(actionError.message || 'Payment action failed');
          onError(actionError.message || 'Payment action failed');
          return;
        }

        if (actionResult?.status === 'succeeded') {
          toast.success('Payment successful!');
          await confirmPayment({ payment_intent_id: actionResult.id }).unwrap();
          onSuccess();
        } else {
          toast.error(`Payment not completed (status: ${actionResult?.status || 'unknown'})`);
          onError(`Payment not completed (status: ${actionResult?.status || 'unknown'})`);
        }
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        await confirmPayment({ payment_intent_id: paymentIntent.id }).unwrap();
        onSuccess();
      } else {
        toast.error(`Payment not completed (status: ${paymentIntent.status})`);
        onError(`Payment not completed (status: ${paymentIntent.status})`);
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
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gold-50)] border border-[var(--color-border-light)]">
          <ShieldCheck className="w-5 h-5 text-[var(--color-gold-500)]" />
        </div>
        <p className="font-ui text-xs text-[var(--color-text-secondary)]">
          Your payment is secured with 256-bit SSL encryption via Stripe.
        </p>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-ui text-xs uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Amount</p>
          <p className="font-display text-lg font-bold text-[var(--color-text-primary)]">${Number(amount || 0).toFixed(2)}</p>
        </div>

        <Button type="submit" disabled={!stripe || !cardComplete || isLoading} className="w-full h-12 text-sm mt-3">
          {isLoading ? 'Processing...' : `Pay Now`}
        </Button>

        <p className="mt-2 text-center font-ui text-[11px] text-[var(--color-text-tertiary)]">
          By placing the order, you agree to our Terms & Conditions.
        </p>
      </div>

    </form>

  );
};
