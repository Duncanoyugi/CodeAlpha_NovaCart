import React from 'react';
import { Search } from 'lucide-react';
import { OrderTableRow } from '../components/OrderTableRow';
import { useGetAdminOrdersQuery } from '../api/adminApi';
import { Pagination } from '../../../components/common/Pagination';
import { ORDER_STATUS } from '../../../utils/constants';

const statusFilterOptions = [
  { value: '', label: 'All Orders' },
  ...Object.entries(ORDER_STATUS).map(([key, val]) => ({ value: key, label: val.label })),
];

export const OrdersManagementPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const { data, isLoading, refetch } = useGetAdminOrdersQuery({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  React.useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Management</span>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mt-2">Orders</h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">Manage and track customer orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
          <input type="text" placeholder="Search by order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none">
          {statusFilterOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-bg-muted)]">
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Order #</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Customer</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Date</th>
                <th className="text-right py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Amount</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Status</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)]">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center"><div className="animate-pulse space-y-3"><div className="h-4 skeleton w-3/4 mx-auto" /><div className="h-4 skeleton w-1/2 mx-auto" /></div></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center font-ui text-sm text-[var(--color-text-secondary)]">No orders found</td></tr>
              ) : orders.map((order) => <OrderTableRow key={order.id} order={order} onRefresh={refetch} />)}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--color-border-light)]">
            <Pagination currentPage={page} totalPages={pagination.total_pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};