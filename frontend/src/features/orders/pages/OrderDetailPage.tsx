import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CircleSlash, MapPin, Receipt, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCancelOrderMutation, useGetOrderQuery } from '../../../redux/api/storeApi';
import { Button, Card, EmptyState, ErrorState, Modal, Skeleton, Textarea, cn } from '../../../components/ui';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import { PaymentPanel } from '../../checkout/components/PaymentPanel';
import { formatPrice } from '../../../utils/formatPrice';
import { ProductImage } from '../../../components/common/ProductImage';
import { ROUTES } from '../../../utils/constants';

const TIMELINE = [
  { key: 'placed_at', label: 'Order placed' },
  { key: 'paid', label: 'Payment received' },
  { key: 'shipped_at', label: 'Shipped' },
  { key: 'delivered_at', label: 'Delivered' },
] as const;

export const OrderDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const { data: order, isLoading, isError, error, refetch } = useGetOrderQuery(id);
  const [cancel, { isLoading: cancelling }] = useCancelOrderMutation();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [reason, setReason] = React.useState('');

  if (isLoading) return <div className="container-page max-w-4xl py-10"><Skeleton className="h-[28rem] w-full" /></div>;
  if ((error as { status?: number } | undefined)?.status === 404) {
    return <EmptyState icon={<CircleSlash className="h-9 w-9" />} title="Order not found" description="We couldn’t find that order on your account." action={<Link to={ROUTES.ORDERS}><Button>My orders</Button></Link>} />;
  }
  if (isError || !order) return <ErrorState onRetry={refetch} />;

  const done: Record<string, boolean> = {
    placed_at: true,
    paid: order.payment_status === 'paid' || order.payment_status === 'refunded',
    shipped_at: !!order.shipped_at || order.status === 'delivered',
    delivered_at: !!order.delivered_at || order.status === 'delivered',
  };
  const cancelled = order.status === 'cancelled';

  const doCancel = async () => {
    try {
      await cancel({ id: order.id, reason }).unwrap();
      toast.success('Order cancelled');
      setConfirmCancel(false);
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not cancel this order');
    }
  };

  return (
    <div className="container-page max-w-4xl py-8 sm:py-10">
      <Link to={ROUTES.ORDERS} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> All orders</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Order {order.order_number}</h1>
          <p className="text-sm text-ink-500">Placed {new Date(order.placed_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <div className="flex gap-2"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.payment_status} /></div>
      </div>

      {order.is_payable && (
        <Card className="mt-6 border-amber-200 bg-amber-50/50 p-6">
          <h2 className="text-lg font-bold">Complete your payment</h2>
          <p className="mb-5 mt-1 text-sm text-ink-600">Your items are reserved for a limited time. Pay now to confirm your order.</p>
          <PaymentPanel orderId={order.id} amount={Number(order.total_amount)} defaultPhone={order.shipping_phone} initialMethod={order.payment_method === 'stripe' ? 'stripe' : 'mpesa'} onPaid={() => refetch()} />
        </Card>
      )}

      {!cancelled && order.status !== 'refunded' && (
        <Card className="mt-6 p-6">
          <ol className="grid grid-cols-4 gap-2">
            {TIMELINE.map((step, i) => (
              <li key={step.key} className="relative text-center">
                {i > 0 && <span className={cn('absolute -left-1/2 right-1/2 top-4 h-0.5', done[step.key] ? 'bg-brand-600' : 'bg-ink-200')} />}
                <span className={cn('relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold', done[step.key] ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-400')}>{done[step.key] ? <Check className="h-4 w-4" /> : i + 1}</span>
                <p className={cn('mt-2 text-[11px] font-semibold sm:text-xs', done[step.key] ? 'text-ink-900' : 'text-ink-400')}>{step.label}</p>
              </li>
            ))}
          </ol>
          {order.tracking_number && <p className="mt-5 flex items-center gap-2 rounded-xl bg-ink-50 p-3 text-sm"><Truck className="h-4 w-4 text-brand-700" /> Tracking: <b>{order.tracking_number}</b>{order.carrier && ` (${order.carrier})`}</p>}
        </Card>
      )}
      {cancelled && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">This order was cancelled{order.payment_status === 'paid' ? '. Our team will process your refund shortly.' : '.'}</p>}

      <div className="mt-6 grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold"><Receipt className="h-5 w-5 text-brand-700" /> Items</h2>
          <ul className="divide-y divide-ink-100">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <ProductImage product={{ image_url: i.product_image, images: [] }} alt="" className="h-16 w-16 rounded-xl bg-ink-100 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{i.product_name}</p>
                  {i.variant_name && <p className="text-xs text-ink-500">{i.variant_name}</p>}
                  <p className="text-xs text-ink-500">{formatPrice(i.price_per_unit)} × {i.quantity}</p>
                </div>
                <p className="font-bold">{formatPrice(i.total_price)}</p>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-bold">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {Number(order.discount_amount) > 0 && <div className="flex justify-between text-brand-700"><dt>Discount {order.coupon_code && `(${order.coupon_code})`}</dt><dd>−{formatPrice(order.discount_amount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd>{Number(order.shipping_cost) === 0 ? 'Free' : formatPrice(order.shipping_cost)}</dd></div>
              <div className="flex justify-between text-xs"><dt className="text-ink-400">Includes VAT</dt><dd className="text-ink-500">{formatPrice(order.tax_amount)}</dd></div>
              <div className="flex justify-between border-t border-ink-100 pt-3 text-base font-extrabold"><dt>Total</dt><dd>{formatPrice(order.total_amount)}</dd></div>
            </dl>
            {order.latest_payment?.receipt_number && <p className="mt-3 text-xs text-ink-500">M-Pesa receipt: <b>{order.latest_payment.receipt_number}</b></p>}
          </Card>
          <Card className="p-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5 text-brand-700" /> Delivery</h2>
            <address className="text-sm not-italic leading-relaxed text-ink-600">
              <b className="text-ink-900">{order.shipping_full_name}</b><br />{order.shipping_address_line1}{order.shipping_address_line2 && `, ${order.shipping_address_line2}`}<br />{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}<br />{order.shipping_phone}
            </address>
          </Card>
          {order.can_cancel && <Button variant="outline" block onClick={() => setConfirmCancel(true)} className="!border-red-200 !text-red-600 hover:!bg-red-50">Cancel order</Button>}
        </div>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this order?" size="sm">
        <p className="text-sm text-ink-600">Your items will be released back to stock. This can’t be undone.</p>
        <div className="mt-4"><Textarea label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <div className="mt-5 flex gap-3"><Button variant="outline" block onClick={() => setConfirmCancel(false)}>Keep order</Button><Button variant="danger" block loading={cancelling} onClick={doCancel}>Cancel order</Button></div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
