import React from 'react';
import { Truck, Shield, RefreshCw } from 'lucide-react';
import { formatPrice } from '../../utils';
import { Button } from '../common/Button';

interface CartSummaryProps {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
  onCheckout?: () => void;
  isCheckout?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shippingCost,
  taxAmount,
  totalAmount,
  itemCount,
  onCheckout,
  isCheckout = false,
}) => {
  const freeShippingThreshold = 50;
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className="bg-[var(--color-bg-muted)] rounded-[var(--radius-xl)] p-6 sm:sticky sm:top-24">
      <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-6">Order Summary</h3>

      {/* Totals */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between font-ui text-sm">
          <span className="text-[var(--color-text-secondary)]">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span className="font-medium text-[var(--color-text-primary)]">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between font-ui text-sm">
          <span className="text-[var(--color-text-secondary)]">Shipping</span>
          <span className={`font-medium ${hasFreeShipping ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-primary)]'}`}>
            {hasFreeShipping ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>

        <div className="flex justify-between font-ui text-sm">
          <span className="text-[var(--color-text-secondary)]">Tax</span>
          <span className="font-medium text-[var(--color-text-primary)]">{formatPrice(taxAmount)}</span>
        </div>

        <div className="border-t border-[var(--color-border-light)] pt-3 mt-3">
          <div className="flex justify-between">
            <span className="font-ui text-base font-bold text-[var(--color-text-primary)]">Total</span>
            <span className="font-ui text-lg font-bold text-[var(--color-gold-600)]">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {!isCheckout && (
        <Button onClick={onCheckout} disabled={itemCount === 0} className="w-full h-12 text-sm">
          Proceed to Checkout
        </Button>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border-light)] grid grid-cols-3 gap-3">
        <div className="text-center">
          <Shield className="w-5 h-5 mx-auto mb-1.5 text-[var(--color-gold-400)]" />
          <p className="text-[10px] font-ui text-[var(--color-text-tertiary)] uppercase tracking-wider">Secure</p>
        </div>
        <div className="text-center">
          <Truck className="w-5 h-5 mx-auto mb-1.5 text-[var(--color-gold-400)]" />
          <p className="text-[10px] font-ui text-[var(--color-text-tertiary)] uppercase tracking-wider">Shipping</p>
        </div>
        <div className="text-center">
          <RefreshCw className="w-5 h-5 mx-auto mb-1.5 text-[var(--color-gold-400)]" />
          <p className="text-[10px] font-ui text-[var(--color-text-tertiary)] uppercase tracking-wider">Returns</p>
        </div>
      </div>
    </div>
  );
};
