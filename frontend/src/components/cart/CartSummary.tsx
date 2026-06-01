import React from 'react';
import { ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';
import { formatPrice } from '../../utils';

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
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      {/* Free Shipping Progress */}
      {!hasFreeShipping && !isCheckout && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Add {formatPrice(remainingForFreeShipping)} more for</span>
            <span className="text-green-600 font-medium">Free Shipping</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 rounded-full h-2 transition-all"
              style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            <span>Shipping</span>
          </div>
          <span>
            {hasFreeShipping ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax (10%)</span>
          <span>{formatPrice(taxAmount)}</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {!isCheckout && (
        <button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className="w-full btn-primary mt-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-5 h-5" />
          Proceed to Checkout
        </button>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="text-xs text-gray-500">
            <Shield className="w-5 h-5 mx-auto mb-1 text-green-600" />
            Secure Payment
          </div>
          <div className="text-xs text-gray-500">
            <RefreshCw className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            30-Day Returns
          </div>
        </div>
      </div>
    </div>
  );
};