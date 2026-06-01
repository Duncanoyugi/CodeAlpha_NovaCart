import React from 'react';
import { formatPrice } from '../../utils';
import type { Order } from '../../types';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="mt-2 text-lg font-semibold">{formatPrice(order.subtotal)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Shipping</p>
          <p className="mt-2 text-lg font-semibold">{formatPrice(order.shipping_cost)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Tax</p>
          <p className="mt-2 text-lg font-semibold">{formatPrice(order.tax_amount)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total</p>
          <p className="mt-2 text-xl font-bold text-primary-600">{formatPrice(order.total_amount)}</p>
        </div>
      </div>
    </div>
  );
};