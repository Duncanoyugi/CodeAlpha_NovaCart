import React from 'react';
import { formatPrice } from '../../utils';
import type { Order } from '../../types';

interface OrderItemsProps {
  order: Order;
}

export const OrderItems: React.FC<OrderItemsProps> = ({ order }) => {
  return (
    <div className="space-y-4">
      {order.items.map((item) => (
        <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <img src={item.product_image} alt={item.product_name} className="w-20 h-20 rounded-lg object-cover" />
            <div>
              <p className="font-semibold">{item.product_name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-center text-sm text-gray-600">
            <span>Unit Price</span>
            <span>{formatPrice(item.price_per_unit)}</span>
          </div>
          <div className="flex items-center justify-between md:justify-end text-sm font-semibold">
            <span>Total</span>
            <span>{formatPrice(item.total_price)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};