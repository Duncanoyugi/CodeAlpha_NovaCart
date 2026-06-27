import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
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
        <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Management
        </span>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] tracking-tight mt-1">
          Orders
        </h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">
          Manage and track customer orders
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] pl-11 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-52 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 appearance-none transition-all cursor-pointer"
          >
            {statusFilterOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-light)]">
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Order #</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Customer</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Date</th>
                <th className="text-right py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Amount</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Status</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Payment</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] animate-pulse" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-muted)] mb-3">
                        <span className="text-[var(--color-text-muted)] font-bold text-sm">0</span>
                      </div>
                      <p className="font-ui text-sm text-[var(--color-text-muted)]">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => <OrderTableRow key={order.id} order={order} onRefresh={refetch} />)
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-5 border-t border-[var(--color-border-light)] bg-[var(--color-bg-surface)]">
            <Pagination currentPage={page} totalPages={pagination.total_pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};
