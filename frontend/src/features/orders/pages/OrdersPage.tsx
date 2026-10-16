import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, PackageSearch } from 'lucide-react';
import { useGetMyOrdersQuery } from '../../../redux/api/storeApi';
import { Button, Card, EmptyState, ErrorState, Skeleton, cn } from '../../../components/ui';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import { formatPrice } from '../../../utils/formatPrice';
import { ProductImage } from '../../../components/common/ProductImage';
import { ROUTES } from '../../../utils/constants';

const FILTERS = [
  { id: '', label: 'All' }, { id: 'pending', label: 'Awaiting payment' }, { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' }, { id: 'delivered', label: 'Delivered' }, { id: 'cancelled', label: 'Cancelled' },
];

export const OrdersPage: React.FC = () => {
  const [status, setStatus] = React.useState('');
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useGetMyOrdersQuery({ page, status: status || undefined });

  return (
    <div className="container-page max-w-4xl py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold">My orders</h1>
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => { setStatus(f.id); setPage(1); }} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition', status === f.id ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 bg-white hover:border-brand-600')}>{f.label}</button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : data && data.orders.length === 0 ? (
          <EmptyState icon={<PackageSearch className="h-9 w-9" />} title="No orders here yet" description="When you place an order it will show up here so you can track it." action={<Link to={ROUTES.PRODUCTS}><Button>Start shopping</Button></Link>} />
        ) : (
          data?.orders.map((o) => (
            <Link key={o.id} to={ROUTES.ORDER_DETAIL(o.id)} className="block">
              <Card className={cn('p-5 transition hover:border-brand-200 hover:shadow-lift', isFetching && 'opacity-70')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{o.order_number}</p>
                    <p className="text-xs text-ink-500">{new Date(o.placed_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })} · {o.total_items} item{o.total_items === 1 ? '' : 's'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2"><OrderStatusBadge status={o.status} /><PaymentStatusBadge status={o.payment_status} /></div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex -space-x-3">
                    {(o.items_summary ?? []).slice(0, 4).map((i) => (
                      <ProductImage key={i.id} product={{ image_url: i.product_image, images: [] }} alt={i.product_name} className="h-12 w-12 rounded-xl border-2 border-white bg-ink-100 object-cover" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-extrabold">{formatPrice(o.total_amount)}</p>
                    <ChevronRight className="h-5 w-5 text-ink-400" />
                  </div>
                </div>
                {o.is_payable && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Payment pending — tap to complete it before your items are released.</p>}
              </Card>
            </Link>
          ))
        )}
      </div>

      {data && data.pagination.total_pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-ink-500">Page {data.pagination.page} of {data.pagination.total_pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pagination.total_pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
