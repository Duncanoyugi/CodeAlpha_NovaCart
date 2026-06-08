import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderCard } from '../../../components/order/OrderCard';
import { Pagination } from '../../../components/common/Pagination';
import { useGetMyOrdersQuery } from '../api/orderApi';
import { ROUTES } from '../../../utils/constants';
import { ORDER_STATUS } from '../../../utils/constants';

export const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useGetMyOrdersQuery({ page, pageSize: 10 } as any);

  const orders = data?.orders || [];
  const totalPages = data?.pagination?.total_pages || 1;

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Account</span>
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">My Orders</h1>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className={`px-4 py-2 rounded-[var(--radius-md)] font-ui text-xs uppercase tracking-wider transition-colors ${!statusFilter ? 'bg-[var(--color-gold-400)] text-[var(--color-gold-800)] font-bold' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]'}`}>
          All
        </button>
        {Object.entries(ORDER_STATUS).map(([key, val]) => (
          <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }} className={`px-4 py-2 rounded-[var(--radius-md)] font-ui text-xs uppercase tracking-wider transition-colors ${statusFilter === key ? 'bg-[var(--color-gold-400)] text-[var(--color-gold-800)] font-bold' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]'}`}>
            {val.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-lg)]" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-[var(--color-text-primary)] mb-2">No orders yet</p>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-6">Start shopping to see your orders here.</p>
          <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};