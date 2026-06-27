import React from 'react';
import { formatPrice, formatDate } from '../../../utils';
import { ORDER_STATUS, PAYMENT_STATUS, ROUTES } from '../../../utils/constants';
import type { Order } from '../../../types';

interface RecentOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-muted)] mb-3">
          <span className="text-[var(--color-text-muted)] text-xs font-bold">0</span>
        </div>
        <p className="font-ui text-sm text-[var(--color-text-muted)]">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-light)]">
            <th className="text-left py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Order
            </th>
            <th className="text-left py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Customer
            </th>
            <th className="text-left py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Date
            </th>
            <th className="text-right py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Amount
            </th>
            <th className="text-left py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Status
            </th>
            <th className="text-left py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Payment
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-light)]">
          {orders.map((order) => (
            <tr key={order.id} className="group hover:bg-[var(--color-bg-muted)] transition-colors duration-150">
              <td className="py-3.5 px-1">
                <span className="font-ui text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {order.order_number}
                </span>
              </td>
              <td className="py-3.5 px-1">
                <span className="font-ui text-sm text-[var(--color-text-secondary)]">
                  {order.shipping_full_name || 'N/A'}
                </span>
              </td>
              <td className="py-3.5 px-1">
                <span className="font-ui text-sm text-[var(--color-text-muted)]">
                  {formatDate(order.placed_at, 'MMM dd, yyyy')}
                </span>
              </td>
              <td className="py-3.5 px-1 text-right">
                <span className="font-ui text-sm font-semibold text-[var(--color-text-primary)]">
                  {formatPrice(order.total_amount)}
                </span>
              </td>
              <td className="py-3.5 px-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'}`}>
                  {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                </span>
              </td>
              <td className="py-3.5 px-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${PAYMENT_STATUS[order.payment_status as keyof typeof PAYMENT_STATUS]?.color || 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'}`}>
                  {PAYMENT_STATUS[order.payment_status as keyof typeof PAYMENT_STATUS]?.label || order.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
