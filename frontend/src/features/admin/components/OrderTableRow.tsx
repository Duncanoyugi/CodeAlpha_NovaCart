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
      return config?.color || 'bg-gray-100 text-gray-700';
    }
    const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS];
    return config?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string, type: 'order' | 'payment') => {
    if (type === 'order') {
      const config = ORDER_STATUS[status as keyof typeof ORDER_STATUS];
      return config?.label || status;
    }
    const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS];
    return config?.label || status;
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition">
        <td className="py-3 px-4">
          <button
            onClick={() => setShowDetailModal(true)}
            className="text-primary-600 hover:text-primary-700 font-mono text-sm"
          >
            {order.order_number}
          </button>
        </td>
        <td className="py-3 px-4 text-sm text-gray-600">
          {order.shipping_address?.full_name || 'N/A'}
        </td>
        <td className="py-3 px-4 text-sm text-gray-500">
          {formatDate(order.placed_at, 'MMM dd, yyyy')}
        </td>
        <td className="py-3 px-4 text-right font-semibold">
          {formatPrice(order.total_amount)}
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status, 'order')}`}>
            {getStatusLabel(order.status, 'order')}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadge(order.payment_status, 'payment')}`}>
            {getStatusLabel(order.payment_status, 'payment')}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetailModal(true)}
              className="p-1 text-gray-500 hover:text-primary-600 rounded transition"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded transition"
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