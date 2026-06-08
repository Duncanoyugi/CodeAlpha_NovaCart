import React from 'react';
import type { Order } from '../../types';
import { formatPrice } from '../../utils';

export const OrderItems: React.FC<{ order: Order }> = ({ order }) => (
  <div className="divide-y divide-[var(--color-border-light)]">
    {order.items.map((item) => (
      <div key={item.id} className="flex gap-4 py-4">
        <div className="w-16 h-20 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-bg-muted)]">
          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <p className="font-ui text-sm font-medium text-[var(--color-text-primary)]">{item.product_name}</p>
          <p className="font-ui text-[11px] text-[var(--color-text-tertiary)]">SKU: {item.product_sku} • Qty: {item.quantity}</p>
        </div>
        <p className="font-ui text-sm font-medium text-[var(--color-gold-600)]">{formatPrice(item.total_price)}</p>
      </div>
    ))}
  </div>
);
