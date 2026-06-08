import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { formatPrice } from '../../utils';

export const OrderCard: React.FC<{ order: any }> = ({ order }) => {
  return (
    <Link to={ROUTES.ORDER_DETAIL(order.id)} className="block bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-md)] transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-ui text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Order #{order.order_number}</p>
          <p className="font-display text-xl font-bold text-[var(--color-text-primary)] mt-1">{formatPrice(order.total_amount)}</p>
          <p className="font-ui text-xs text-[var(--color-text-tertiary)] mt-1">{order.item_count} items • {new Date(order.placed_at).toLocaleDateString()}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full font-ui text-[11px] font-medium tracking-wider ${
          order.status === 'delivered' ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]' :
          order.status === 'pending' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]' :
          order.status === 'cancelled' ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]' :
          'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]'
        }`}>
          {order.status.toUpperCase()}
        </span>
      </div>
    </Link>
  );
};
