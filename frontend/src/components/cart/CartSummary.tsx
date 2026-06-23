import React from 'react';
import { Truck, Shield, RefreshCw, Tag } from 'lucide-react';
import { formatPrice } from '../../utils';
import { Button } from '../common/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
  const [couponCode, setCouponCode] = useState('');
  const freeShippingThreshold = 50;
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast.success('Coupon applied! (Placeholder — backend integration needed)');
      setCouponCode('');
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] overflow-hidden lg:sticky lg:top-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
        <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Order Summary</h3>
        <p className="font-body text-xs text-[var(--color-text-muted)] mt-1">
          {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      {/* Free Shipping Progress */}
      {!hasFreeShipping && !isCheckout && remainingForFreeShipping > 0 && (
        <div className="px-6 py-4 bg-[var(--color-primary)]/5 border-b border-[var(--color-primary)]/10">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-xs font-body font-semibold text-[var(--color-primary)]">
              Add {formatPrice(remainingForFreeShipping)} more for free shipping!
            </span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-primary)]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {hasFreeShipping && !isCheckout && (
        <div className="px-6 py-3 bg-[var(--color-success)]/10 border-b border-[var(--color-success)]/20 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[var(--color-success)]" />
          <span className="text-xs font-body font-semibold text-[var(--color-success)]">
            You've unlocked free shipping!
          </span>
        </div>
      )}

      {/* Totals */}
      <div className="px-6 py-5 space-y-3">
        <div className="flex justify-between items-center font-body text-sm">
          <span className="text-[var(--color-text-secondary)]">Subtotal</span>
          <span className="font-medium text-[var(--color-text-primary)] tabular-nums">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center font-body text-sm">
          <span className="text-[var(--color-text-secondary)]">Shipping</span>
          <span className={`font-semibold ${hasFreeShipping ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'}`}>
            {hasFreeShipping ? 'FREE' : formatPrice(shippingCost)}
          </span>
        </div>

        <div className="flex justify-between items-center font-body text-sm">
          <span className="text-[var(--color-text-secondary)]">Estimated Tax</span>
          <span className="font-medium text-[var(--color-text-primary)] tabular-nums">{formatPrice(taxAmount)}</span>
        </div>

        {isCheckout && (
          <div className="pt-3 mt-3 border-t border-[var(--color-border)]">
            <div className="flex justify-between items-center">
              <span className="font-body text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Have a coupon?
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
              />
              <Button size="sm" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>
                Apply
              </Button>
            </div>
          </div>
        )}

        <div className="border-t-2 border-[var(--color-border-medium)] pt-4 mt-2">
          <div className="flex justify-between items-baseline">
            <span className="font-body text-base font-bold text-[var(--color-text-primary)]">Total</span>
            <span className="font-body text-2xl font-bold text-[var(--color-primary)] tabular-nums">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {!isCheckout && (
        <div className="px-6 pb-6">
          <Button
            onClick={onCheckout}
            disabled={itemCount === 0}
            className="w-full h-12 text-sm font-semibold"
          >
            Proceed to Checkout
          </Button>
        </div>
      )}

      {/* Trust Badges */}
      <div className="px-6 py-5 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/50">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <p className="text-[10px] font-body text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <p className="text-[10px] font-body text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Shipping</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <p className="text-[10px] font-body text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Returns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;