import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Package, ArrowRight } from 'lucide-react';
import { useGetOrderQuery } from '../../../redux/api/storeApi';
import { Button, Card, Skeleton, Spinner } from '../../../components/ui';
import { formatPrice } from '../../../utils/formatPrice';
import { ProductImage } from '../../../components/common/ProductImage';
import { ROUTES } from '../../../utils/constants';

export const OrderSuccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order') ?? '';
  // Poll briefly: the M-Pesa callback can land a moment after the customer sees success.
  const { data: order, isLoading, refetch } = useGetOrderQuery(orderId, { skip: !orderId });
  const [settling, setSettling] = React.useState(true);

  React.useEffect(() => {
    if (!orderId || order?.payment_status === 'paid') { setSettling(false); return; }
    const t = window.setInterval(() => refetch(), 3000);
    const stop = window.setTimeout(() => setSettling(false), 30000);
    return () => { window.clearInterval(t); window.clearTimeout(stop); };
  }, [orderId, order?.payment_status, refetch]);

  if (!orderId) return <div className="container-page py-16 text-center"><Link to={ROUTES.ORDERS}><Button>View my orders</Button></Link></div>;
  if (isLoading) return <div className="container-page max-w-2xl py-12"><Skeleton className="h-96 w-full" /></div>;

  const paid = order?.payment_status === 'paid';
  return (
    <div className="container-page max-w-2xl py-12">
      <div className="text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${paid ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-600'}`}>
          {paid ? <CheckCircle2 className="h-11 w-11" /> : settling ? <Spinner className="h-9 w-9 text-amber-600" /> : <Clock className="h-11 w-11" />}
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">{paid ? 'Order confirmed!' : 'Confirming your payment…'}</h1>
        <p className="mt-2 text-ink-500">
          {paid ? <>Thank you! We’ve emailed a confirmation to <b>{order?.shipping_email}</b>.</> : 'This usually takes a few seconds. You can safely leave this page — we’ll update your order automatically.'}
        </p>
      </div>

      {order && (
        <Card className="mt-8 p-6">
          <div className="flex flex-wrap justify-between gap-2 border-b border-ink-100 pb-4 text-sm">
            <div><p className="text-ink-500">Order number</p><p className="font-extrabold">{order.order_number}</p></div>
            <div className="text-right"><p className="text-ink-500">Total paid</p><p className="font-extrabold">{formatPrice(order.total_amount)}</p></div>
          </div>
          <ul className="divide-y divide-ink-100">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <ProductImage product={{ image_url: i.product_image, images: [] }} alt="" className="h-14 w-14 rounded-lg bg-ink-100 object-cover" />
                <div className="min-w-0 flex-1"><p className="line-clamp-1 text-sm font-semibold">{i.product_name}</p><p className="text-xs text-ink-500">Qty {i.quantity}</p></div>
                <p className="text-sm font-bold">{formatPrice(i.total_price)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm"><p className="font-bold">Delivering to</p><p className="mt-1 text-ink-600">{order.shipping_full_name}, {order.shipping_address_line1}, {order.shipping_city}, {order.shipping_state}</p></div>
        </Card>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={ROUTES.ORDER_DETAIL(orderId)}><Button size="lg" block leftIcon={<Package className="h-5 w-5" />}>Track order</Button></Link>
        <Link to={ROUTES.PRODUCTS}><Button size="lg" variant="outline" block rightIcon={<ArrowRight className="h-5 w-5" />}>Keep shopping</Button></Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
