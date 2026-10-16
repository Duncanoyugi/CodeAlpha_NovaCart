import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { CheckCircle2, CreditCard, Lock, RefreshCw, Smartphone, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useConfirmCardPaymentMutation, useCreateCardIntentMutation, useGetMpesaStatusQuery,
  useGetPaymentConfigQuery, useStartMpesaMutation,
} from '../../../redux/api/storeApi';
import { Button, Input, Spinner, cn } from '../../../components/ui';
import { formatPrice } from '../../../utils/formatPrice';
import { KENYAN_PHONE, cleanPhone } from '../../../utils/kenya';

type Method = 'mpesa' | 'stripe';
const TERMINAL_FAIL = ['failed', 'cancelled', 'expired'];

const stripeCache = new Map<string, Promise<Stripe | null>>();
const getStripe = (key: string) => {
  if (!stripeCache.has(key)) stripeCache.set(key, loadStripe(key));
  return stripeCache.get(key)!;
};

/* ------------------------------------------------------------------ M-Pesa */
const MpesaPay: React.FC<{ orderId: string; amount: number; defaultPhone?: string; onPaid: () => void }> = ({ orderId, amount, defaultPhone = '', onPaid }) => {
  const [phone, setPhone] = React.useState(defaultPhone);
  const [phoneError, setPhoneError] = React.useState('');
  const [paymentId, setPaymentId] = React.useState<string | null>(null);
  const [failure, setFailure] = React.useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const [start, { isLoading: starting }] = useStartMpesaMutation();
  const paidRef = React.useRef(false);

  const { data: status } = useGetMpesaStatusQuery(paymentId ?? '', {
    skip: !paymentId || !!failure,
    pollingInterval: 3000,
    refetchOnMountOrArgChange: true,
  });

  React.useEffect(() => {
    if (!status || paidRef.current) return;
    if (status.status === 'succeeded' || status.order_payment_status === 'paid') {
      paidRef.current = true;
      onPaid();
    } else if (TERMINAL_FAIL.includes(status.status)) {
      setPaymentId(null);
      setFailure(
        status.status === 'cancelled' ? 'You cancelled the M-Pesa request.'
          : status.status === 'expired' ? 'The M-Pesa request timed out. Nothing was charged.'
          : status.result_description || 'The M-Pesa payment did not go through. Nothing was charged.',
      );
    }
  }, [status, onPaid]);

  React.useEffect(() => {
    if (!paymentId) return;
    setSecondsLeft(150);
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => window.clearInterval(t);
  }, [paymentId]);

  const pay = async () => {
    const cleaned = cleanPhone(phone);
    if (!KENYAN_PHONE.test(cleaned)) {
      setPhoneError('Enter a valid Safaricom number, e.g. 0712 345 678');
      return;
    }
    setPhoneError('');
    setFailure(null);
    try {
      const res = await start({ order_id: orderId, phone: cleaned }).unwrap();
      setPaymentId(res.payment_id);
    } catch (err) {
      setFailure((err as { message?: string }).message ?? 'Could not start M-Pesa payment. Please try again.');
    }
  };

  if (paymentId) {
    return (
      <div className="rounded-2xl bg-brand-50 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft"><Smartphone className="h-8 w-8 animate-pulse text-brand-700" /></div>
        <h3 className="font-sans text-lg font-bold">Check your phone</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
          We sent an M-Pesa prompt for <b>{formatPrice(amount)}</b> to <b>{cleanPhone(phone)}</b>. Enter your M-Pesa PIN to complete the payment.
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-brand-800"><Spinner className="h-4 w-4" /> Waiting for confirmation… {secondsLeft > 0 && <span className="tabular-nums text-ink-500">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>}</p>
        <button onClick={() => { setPaymentId(null); setFailure('Request abandoned. If you already entered your PIN, wait a minute and refresh your orders before retrying.'); }} className="mt-4 text-xs font-semibold text-ink-500 underline">Didn’t get the prompt?</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {failure && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>{failure}</p>
        </div>
      )}
      <Input label="M-Pesa phone number" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} error={phoneError} hint="You’ll get an STK prompt on this number." leftIcon={<Smartphone className="h-4.5 w-4.5" />} />
      <Button block size="lg" loading={starting} onClick={pay} leftIcon={failure ? <RefreshCw className="h-5 w-5" /> : undefined}>
        {failure ? 'Try again' : `Pay ${formatPrice(amount)} with M-Pesa`}
      </Button>
    </div>
  );
};

/* -------------------------------------------------------------------- Card */
const CardPay: React.FC<{ orderId: string; amount: number; onPaid: () => void }> = ({ orderId, amount, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [createIntent] = useCreateCardIntentMutation();
  const [confirm] = useConfirmCardPaymentMutation();
  const [busy, setBusy] = React.useState(false);
  const [complete, setComplete] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const card = elements?.getElement(CardElement);
    if (!stripe || !card) return;
    setBusy(true);
    setError('');
    try {
      const intent = await createIntent({ order_id: orderId }).unwrap();
      const result = await stripe.confirmCardPayment(intent.client_secret, { payment_method: { card } });
      if (result.error) {
        setError(result.error.message ?? 'Your card was declined.');
        return;
      }
      await confirm({ payment_intent_id: result.paymentIntent!.id }).unwrap();
      onPaid();
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Payment failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink-700">Card details</label>
        <div className="rounded-xl border border-ink-200 bg-white p-4 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100">
          <CardElement onChange={(e) => { setComplete(e.complete); if (e.error) setError(e.error.message); else setError(''); }} options={{ hidePostalCode: true, style: { base: { fontSize: '16px', color: '#141916', fontFamily: 'Plus Jakarta Sans, sans-serif', '::placeholder': { color: '#98a19b' } }, invalid: { color: '#dc2626' } } }} />
        </div>
        {error && <p className="mt-2 text-xs font-medium text-red-600" role="alert">{error}</p>}
      </div>
      <Button type="submit" block size="lg" loading={busy} disabled={!stripe || !complete} leftIcon={<Lock className="h-4.5 w-4.5" />}>Pay {formatPrice(amount)}</Button>
      <p className="text-center text-xs text-ink-500">Payments are encrypted and processed by Stripe. We never see your card number.</p>
    </form>
  );
};

/* ------------------------------------------------------------------- Panel */
export const PaymentPanel: React.FC<{
  orderId: string;
  amount: number;
  defaultPhone?: string;
  initialMethod?: Method;
  onPaid: () => void;
}> = ({ orderId, amount, defaultPhone, initialMethod = 'mpesa', onPaid }) => {
  const { data: config, isLoading, isError } = useGetPaymentConfigQuery();
  const [method, setMethod] = React.useState<Method>(initialMethod);

  React.useEffect(() => {
    if (!config) return;
    if (method === 'mpesa' && !config.mpesa_enabled && config.card_enabled) setMethod('stripe');
    if (method === 'stripe' && !config.card_enabled && config.mpesa_enabled) setMethod('mpesa');
  }, [config, method]);

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (isError || !config) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">We couldn’t load payment options. Please refresh the page.</p>;
  if (!config.mpesa_enabled && !config.card_enabled) {
    return <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Online payment is temporarily unavailable. Your order is saved — please contact support to complete it.</p>;
  }

  const tabs = [
    { id: 'mpesa' as const, label: 'M-Pesa', icon: Smartphone, enabled: config.mpesa_enabled },
    { id: 'stripe' as const, label: 'Card', icon: CreditCard, enabled: config.card_enabled },
  ].filter((t) => t.enabled);

  const handlePaid = () => {
    toast.success('Payment received!');
    onPaid();
  };

  return (
    <div>
      {tabs.length > 1 && (
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-ink-100 p-1.5" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} role="tab" aria-selected={method === id} onClick={() => setMethod(id)} className={cn('flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition', method === id ? 'bg-white text-brand-800 shadow-soft' : 'text-ink-500 hover:text-ink-800')}>
              <Icon className="h-4.5 w-4.5" /> {label}
            </button>
          ))}
        </div>
      )}
      {method === 'mpesa' ? (
        <MpesaPay orderId={orderId} amount={amount} defaultPhone={defaultPhone} onPaid={handlePaid} />
      ) : (
        <Elements stripe={getStripe(config.stripe_public_key)}>
          <CardPay orderId={orderId} amount={amount} onPaid={handlePaid} />
        </Elements>
      )}
    </div>
  );
};

export const PaidBanner: React.FC = () => (
  <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-brand-900"><CheckCircle2 className="h-6 w-6" /><p className="font-semibold">Payment received — thank you!</p></div>
);
