import React from 'react';
import { Link } from 'react-router-dom';
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
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders found
      </div>
    );
  }

  const getStatusColor = (status: string, type: 'order' | 'payment') => {
    if (type === 'order') {
      const config = ORDER_STATUS[status as keyof typeof ORDER_STATUS];
      return config?.color || 'bg-gray-100 text-gray-700';
    }
    const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS];
    return config?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order #</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition">
              <td className="py-3 px-4">
                <Link
                  to={ROUTES.ADMIN_ORDERS}
                  className="text-primary-600 hover:text-primary-700 font-mono text-sm"
                >
                  {order.order_number}
                </Link>
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
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status, 'order')}`}>
                  {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.payment_status, 'payment')}`}>
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