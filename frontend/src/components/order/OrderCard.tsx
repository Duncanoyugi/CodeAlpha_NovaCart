import React from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../types';
import { formatDate, formatPrice } from '../../utils';
import { ORDER_STATUS, ROUTES } from '../../utils/constants';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
          <p className="text-gray-500 text-sm">{formatDate(order.placed_at, 'MMM dd, yyyy')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <img 
              src={item.product_image} 
              alt={item.product_name} 
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.product_name}</p>
              <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium">{formatPrice(item.total_price)}</p>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="font-semibold text-lg">{formatPrice(order.total_amount)}</span>
        <Link 
          to={ROUTES.ORDER_DETAIL(order.id)} 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;