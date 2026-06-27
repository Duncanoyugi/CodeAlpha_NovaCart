import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Order } from '../../../types';
import { formatDate, formatPrice } from '../../../utils';
import { ROUTES, ORDER_STATUS } from '../../../utils/constants';

interface OrderCardProps {
  order: Order;
}

const StatusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  processing: <Package className="w-5 h-5 text-blue-500" />,
  shipped: <Truck className="w-5 h-5 text-purple-500" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusConfig = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="p-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <Link
              to={ROUTES.ORDER_DETAIL(order.id)}
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              {order.order_number}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-500">Placed on</p>
            <p className="font-medium">{formatDate(order.placed_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-bold text-primary-600">{formatPrice(order.total_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center gap-1 mt-1">
              {StatusIcon[order.status]}
              <span className={`font-medium ${statusConfig?.color || 'text-gray-600'}`}>
                {statusConfig?.label || order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex -space-x-2">
            {(order.items_summary || []).slice(0, 3).map((item: any) => (
              <img
                key={item.id}
                src={item.product_image}
                alt={item.product_name}
                className="w-12 h-12 rounded-lg border-2 border-white object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {order.total_items || (order.items_summary?.length || 0)} item{(order.total_items || order.items_summary?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t flex justify-end gap-3">
          <Link
            to={ROUTES.ORDER_DETAIL(order.id)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};