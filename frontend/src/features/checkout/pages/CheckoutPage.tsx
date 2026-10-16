import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, MapPin, Smartphone, Tag, X, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../cart/hooks/useCart';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchCart } from '../../../redux/slices/cartSlice';
import { useCancelOrderMutation, usePlaceOrderMutation, useValidateCouponMutation } from '../../../redux/api/storeApi';
import type { CouponPreview } from '../../../redux/api/storeApi';
import { Button, Card, Input, Select, Steps, Textarea, Skeleton } from '../../../components/ui';
import { PaymentPanel } from '../components/PaymentPanel';
import { formatPrice } from '../../../utils/formatPrice';
import { ProductImage } from '../../../components/common/ProductImage';
import { KENYA_COUNTIES, KENYAN_PHONE, cleanPhone } from '../../../utils/kenya';
import { ROUTES } from '../../../utils/constants';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().refine((v) => KENYAN_PHONE.test(cleanPhone(v)), 'Enter a valid Kenyan phone number'),
  address_line1: z.string().trim().min(3, 'Enter your street address or building'),
  address_line2: z.string().optional(),
  city: z.string().trim().min(2, 'Enter your town / city'),
  state: z.string().min(1, 'Select your county'),
  postal_code: z.string().trim().min(1, 'Enter a postal code (use 00100 if unsure)'),
  customer_notes: z.string().max(500).optional(),
  payment_method: z.enum(['mpesa', 'stripe']),
});
type FormValues = z.infer<typeof schema>;

interface PlacedOrder { id: string; number: string; total: number }

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { items, isLoading, subtotal, shippingCost, taxAmount, totalAmount } = useCart();
  const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [validateCoupon, { isLoading: checkingCoupon }] = useValidateCouponMutation();
  const [couponInput, setCouponInput] = React.useState('');
  const [coupon, setCoupon] = React.useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = React.useState('');
  const [order, setOrder] = React.useState<PlacedOrder | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('nc_pending_order') ?? 'null'); } catch { return null; }
  });
  const [summaryItems, setSummaryItems] = React.useState(items);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'mpesa', state: 'Nairobi', postal_code: '00100' },
  });

  // Prefill from the account once it's available.
  React.useEffect(() => {
    if (!user) return;
    setValue('full_name', user.full_name ?? '', { shouldDirty: false });
    setValue('email', user.email ?? '', { shouldDirty: false });
    if (user.phone_number) setValue('phone', user.phone_number);
    const a = (user as unknown as { address?: Record<string, string> }).address;
    if (a?.line1) setValue('address_line1', a.line1);
    if (a?.city) setValue('city', a.city);
    if (a?.state && KENYA_COUNTIES.includes(a.state)) setValue('state', a.state);
    if (a?.postal_code) setValue('postal_code', a.postal_code);
  }, [user, setValue]);

  React.useEffect(() => { if (items.length) setSummaryItems(items); }, [items]);
  React.useEffect(() => { if (order) sessionStorage.setItem('nc_pending_order', JSON.stringify(order)); else sessionStorage.removeItem('nc_pending_order'); }, [order]);

  if (!order && isLoading && items.length === 0) return <div className="container-page py-10"><Skeleton className="h-96 w-full" /></div>;
  if (!order && !isLoading && items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-lg font-bold">Your cart is empty</p>
        <Link to={ROUTES.PRODUCTS} className="mt-4 inline-block font-semibold text-brand-700 hover:underline">Continue shopping</Link>
      </div>
    );
  }

  const discount = coupon?.discount ?? 0;
  const shown = coupon ?? { shipping_cost: shippingCost, tax_amount: taxAmount, total_amount: totalAmount };
  const payable = order ? order.total : shown.total_amount;

  const applyCoupon = async () => {
    setCouponError('');
    try {
      setCoupon(await validateCoupon(couponInput.trim()).unwrap());
      toast.success('Coupon applied');
    } catch (err) {
      setCoupon(null);
      setCouponError((err as { message?: string }).message ?? 'Invalid coupon');
    }
  };

  const onSubmit = async (v: FormValues) => {
    try {
      const res = await placeOrder({
        shipping_address: { full_name: v.full_name, email: v.email, phone: cleanPhone(v.phone), address_line1: v.address_line1, address_line2: v.address_line2 ?? '', city: v.city, state: v.state, postal_code: v.postal_code, country: 'Kenya' },
        billing_address: { same_as_shipping: true },
        payment_method: v.payment_method,
        customer_notes: v.customer_notes,
        coupon_code: coupon?.code,
      }).unwrap();
      setOrder({ id: res.order_id, number: res.order_number, total: Number(res.total_amount) });
      dispatch(fetchCart());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not place your order');
      dispatch(fetchCart());
    }
  };

  const onPaid = () => {
    const id = order!.id;
    setOrder(null);
    navigate(`${ROUTES.ORDER_SUCCESS}?order=${id}`, { replace: true });
  };

  const abandon = async () => {
    try {
      await cancelOrder({ id: order!.id, reason: 'Cancelled during checkout' }).unwrap();
      toast.success('Order cancelled — your items are available again');
      setOrder(null);
      navigate(ROUTES.CART);
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not cancel the order');
    }
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-8"><Steps steps={['Cart', 'Delivery', 'Payment']} current={order ? 2 : 1} /></div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          {!order ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <Card className="p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5 text-brand-700" /> Delivery details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" autoComplete="name" {...register('full_name')} error={errors.full_name?.message} />
                  <Input label="Phone number" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" {...register('phone')} error={errors.phone?.message} />
                  <div className="sm:col-span-2"><Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} hint="We’ll send your order confirmation here." /></div>
                  <div className="sm:col-span-2"><Input label="Street address / building" autoComplete="address-line1" placeholder="e.g. Moi Avenue, Kilimani Plaza, 3rd floor" {...register('address_line1')} error={errors.address_line1?.message} /></div>
                  <div className="sm:col-span-2"><Input label="Apartment, landmark (optional)" autoComplete="address-line2" {...register('address_line2')} /></div>
                  <Input label="Town / city" autoComplete="address-level2" {...register('city')} error={errors.city?.message} />
                  <Select label="County" {...register('state')} error={errors.state?.message}>{KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select>
                  <Input label="Postal code" autoComplete="postal-code" {...register('postal_code')} error={errors.postal_code?.message} />
                  <Input label="Country" value="Kenya" disabled readOnly />
                  <div className="sm:col-span-2"><Textarea label="Delivery notes (optional)" placeholder="Gate colour, call on arrival, etc." {...register('customer_notes')} /></div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-4 text-lg font-bold">How would you like to pay?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    { id: 'mpesa', title: 'M-Pesa', text: 'Approve a prompt on your phone', icon: Smartphone },
                    { id: 'stripe', title: 'Card', text: 'Visa or Mastercard', icon: CreditCard },
                  ] as const).map(({ id, title, text, icon: Icon }) => (
                    <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50 ${watch('payment_method') === id ? '' : 'border-ink-200 hover:border-ink-300'}`}>
                      <input type="radio" value={id} {...register('payment_method')} className="sr-only" />
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 shadow-soft"><Icon className="h-5 w-5" /></span>
                      <span><span className="block font-bold">{title}</span><span className="text-xs text-ink-500">{text}</span></span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-500">You’ll complete payment on the next step. Your items are reserved while you pay.</p>
              </Card>

              <Button type="submit" size="lg" block loading={placing} leftIcon={<Lock className="h-5 w-5" />}>Continue to payment · {formatPrice(shown.total_amount)}</Button>
            </form>
          ) : (
            <Card className="p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold"><Lock className="h-5 w-5 text-brand-700" /> Pay for order {order.number}</h2>
                  <p className="mt-1 text-sm text-ink-500">Amount due: <b className="text-ink-900">{formatPrice(order.total)}</b></p>
                </div>
              </div>
              <PaymentPanel orderId={order.id} amount={order.total} defaultPhone={cleanPhone(watch('phone') ?? user?.phone_number ?? '')} initialMethod={watch('payment_method')} onPaid={onPaid} />
              <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4 text-sm">
                <button onClick={abandon} disabled={cancelling} className="flex items-center gap-1.5 font-semibold text-ink-500 hover:text-red-600"><ArrowLeft className="h-4 w-4" /> Cancel order & edit cart</button>
                <Link to={ROUTES.ORDERS} className="font-semibold text-brand-700 hover:underline">Pay later from My orders</Link>
              </div>
            </Card>
          )}
        </div>

        <aside>
          <Card className="sticky top-32 p-6">
            <h2 className="text-lg font-bold">Order summary</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {summaryItems.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    <ProductImage product={i.product} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-ink-900 px-1 text-[10px] font-bold text-white">{i.quantity}</span>
                  </span>
                  <p className="line-clamp-2 flex-1 text-sm font-medium">{i.product.name}</p>
                  <p className="text-sm font-bold">{formatPrice(i.subtotal)}</p>
                </li>
              ))}
            </ul>

            {!order && (
              <div className="mt-5 border-t border-ink-100 pt-5">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm">
                    <span className="flex items-center gap-2 font-bold text-brand-800"><Tag className="h-4 w-4" /> {coupon.code}</span>
                    <button onClick={() => { setCoupon(null); setCouponInput(''); }} aria-label="Remove coupon" className="rounded-full p-1 hover:bg-brand-100"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" className="h-10 flex-1 rounded-xl border border-ink-200 px-3 text-sm uppercase focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100" />
                      <Button size="sm" variant="outline" loading={checkingCoupon} disabled={!couponInput.trim()} onClick={applyCoupon}>Apply</Button>
                    </div>
                    {couponError && <p className="mt-1.5 text-xs font-medium text-red-600">{couponError}</p>}
                  </div>
                )}
              </div>
            )}

            <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-5 text-sm">
              {!order && <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>}
              {discount > 0 && !order && <div className="flex justify-between text-brand-700"><dt>Coupon discount</dt><dd className="font-semibold">−{formatPrice(discount)}</dd></div>}
              {!order && <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd className="font-semibold">{shown.shipping_cost === 0 ? <span className="text-brand-700">Free</span> : formatPrice(shown.shipping_cost)}</dd></div>}
              {!order && <div className="flex justify-between text-xs"><dt className="text-ink-400">Includes VAT</dt><dd className="text-ink-500">{formatPrice(shown.tax_amount)}</dd></div>}
              <div className="flex justify-between border-t border-ink-100 pt-3 text-base"><dt className="font-bold">Total</dt><dd className="text-xl font-extrabold">{formatPrice(payable)}</dd></div>
            </dl>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500"><ShieldCheck className="h-4 w-4 text-brand-600" /> Secure checkout</p>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
