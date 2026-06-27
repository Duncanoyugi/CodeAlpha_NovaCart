import React, { useState } from 'react';
import { Eye, Edit2, MoreVertical } from 'lucide-react';
import type { Order } from '../../../types';
import { formatPrice, formatDate } from '../../../utils';
import { ORDER_STATUS, PAYMENT_STATUS, ROUTES } from '../../../utils/constants';
import { OrderStatusModal } from './OrderStatusModal';
import { OrderDetailModal } from './OrderDetailModal';

interface OrderTableRowProps {
  order: Order;
  onRefresh: () => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({ order, onRefresh }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    if (type === 'order') {
      const config = ORDER_STATUS[status as keyof typeof ORDER_STATUS];
      return config?.color || 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]';
    }
    const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS];
    return config?.color || 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]';
  };

  const getStatusLabel = (status: string, type: 'order' | 'payment') => {
    if (type === 'order') return ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.label || status;
    return PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS]?.label || status;
  };

  return (
    <>
      <tr className="group hover:bg-[var(--color-bg-muted)] transition-colors duration-150">
        <td className="py-4 px-4">
          <span className="font-ui text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
            {order.order_number}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="font-ui text-sm text-[var(--color-text-secondary)]">
            {order.shipping_full_name || 'N/A'}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="font-ui text-sm text-[var(--color-text-muted)]">
            {formatDate(order.placed_at, 'MMM dd, yyyy')}
          </span>
        </td>
        <td className="py-4 px-4 text-right">
          <span className="font-ui text-sm font-semibold text-[var(--color-text-primary)]">
            {formatPrice(order.total_amount)}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${getStatusBadge(order.status, 'order')}`}>
            {getStatusLabel(order.status, 'order')}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${getStatusBadge(order.payment_status, 'payment')}`}>
            {getStatusLabel(order.payment_status, 'payment')}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDetailModal(true)}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-muted)] transition-all duration-150"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-muted)] transition-all duration-150"
              title="Update Status"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      <OrderStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        orderId={order.id}
        currentStatus={order.status}
        currentTrackingNumber={order.tracking_number}
        currentCarrier={order.carrier}
        onSuccess={onRefresh}
      />

      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={order}
      />
    </>
  );
};
