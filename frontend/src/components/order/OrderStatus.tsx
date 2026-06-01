import React from 'react';
import { formatDate } from '../../utils';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';
import type { Order } from '../../types';

interface OrderStatusProps {
  order: Order;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const status = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
  const payment = PAYMENT_STATUS[order.payment_status as keyof typeof PAYMENT_STATUS];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Order Status</p>
        <p className="text-lg font-semibold capitalize">{status?.label || order.status}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Payment Status</p>
        <p className="text-lg font-semibold capitalize">{payment?.label || order.payment_status}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Placed At</p>
        <p className="text-lg font-semibold">{formatDate(order.placed_at)}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-lg font-semibold">${order.total_amount.toFixed(2)}</p>
      </div>
    </div>
  );
};