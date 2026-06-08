import React, { useState } from 'react';
import { Eye, Edit2 } from 'lucide-react';
import type { Order } from '../../../types';
import { formatPrice, formatDate } from '../../../utils';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../../utils/constants';
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
      return config?.color || 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]';
    }
    const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS];
    return config?.color || 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]';
  };

  const getStatusLabel = (status: string, type: 'order' | 'payment') => {
    if (type === 'order') return ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.label || status;
    return PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS]?.label || status;
  };

  return (
    <>
      <tr className="hover:bg-[var(--color-bg-muted)] transition-colors">
        <td className="py-3 px-4">
          <button onClick={() => setShowDetailModal(true)} className="font-ui text-sm font-medium text-[var(--color-text-accent)] hover:underline">
            {order.order_number}
          </button>
        </td>
        <td className="py-3 px-4 font-ui text-sm text-[var(--color-text-secondary)]">{order.shipping_address?.full_name || 'N/A'}</td>
        <td className="py-3 px-4 font-ui text-sm text-[var(--color-text-tertiary)]">{formatDate(order.placed_at, 'MMM dd, yyyy')}</td>
        <td className="py-3 px-4 text-right font-ui text-sm font-medium text-[var(--color-text-primary)]">{formatPrice(order.total_amount)}</td>
        <td className="py-3 px-4">
          <span className={`inline-flex px-2.5 py-1 rounded-full font-ui text-[11px] font-medium tracking-wider ${getStatusBadge(order.status, 'order')}`}>
            {getStatusLabel(order.status, 'order')}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowDetailModal(true)} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-accent)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-muted)] transition-colors" title="View Details">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => setShowStatusModal(true)} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-accent)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-muted)] transition-colors" title="Update Status">
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
