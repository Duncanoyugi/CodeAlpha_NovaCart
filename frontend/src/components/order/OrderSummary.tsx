import React from 'react';
import type { Order } from '../../types';
import { formatPrice } from '../../utils';

export const OrderSummary: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between font-ui text-sm">
        <span className="text-[var(--color-text-secondary)]">Subtotal</span>
        <span className="font-medium text-[var(--color-text-primary)]">{formatPrice(order.subtotal)}</span>
      </div>
      <div className="flex justify-between font-ui text-sm">
        <span className="text-[var(--color-text-secondary)]">Shipping</span>
        <span className="font-medium text-[var(--color-text-primary)]">{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Free'}</span>
      </div>
      <div className="flex justify-between font-ui text-sm">
        <span className="text-[var(--color-text-secondary)]">Tax</span>
        <span className="font-medium text-[var(--color-text-primary)]">{formatPrice(order.tax_amount)}</span>
      </div>
      {order.discount_amount > 0 && (
        <div className="flex justify-between font-ui text-sm">
          <span className="text-[var(--color-text-secondary)]">Discount</span>
          <span className="font-medium text-[var(--color-success-text)]">-{formatPrice(order.discount_amount)}</span>
        </div>
      )}
      <div className="border-t border-[var(--color-border-light)] pt-3">
        <div className="flex justify-between">
          <span className="font-ui text-base font-bold text-[var(--color-text-primary)]">Total</span>
          <span className="font-ui text-lg font-bold text-[var(--color-gold-600)]">{formatPrice(order.total_amount)}</span>
        </div>
      </div>
      {order.payment_status === 'paid' && (
        <div className="flex items-center gap-2 pt-2">
          <svg className="w-4 h-4 text-[var(--color-success-text)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="font-ui text-xs text-[var(--color-success-text)]">Payment Confirmed</span>
        </div>
      )}
    </div>
  );
};

