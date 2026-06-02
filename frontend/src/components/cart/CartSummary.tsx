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
    <div className="rounded-3xl border border-gray-200 bg-white p-8 sticky top-24 shadow-sm">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h3>

      {/* Free Shipping Progress */}
      {!hasFreeShipping && !isCheckout && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700">Add {formatPrice(remainingForFreeShipping)} more for</span>
            <span className="text-green-600 font-bold">Free Shipping 🚚</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 rounded-full h-3 transition-all"
              style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#ff902b]" />
            <span>Shipping</span>
          </div>
          <span className="font-medium">
            {hasFreeShipping ? (
              <span className="text-green-600 font-bold">Free</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Tax (10%)</span>
          <span className="font-medium">{formatPrice(taxAmount)}</span>
        </div>

        <div className="border-t-2 border-gray-200 pt-4 mt-4">
          <div className="flex justify-between">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#ff902b]">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {!isCheckout && (
        <button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className="w-full bg-gradient-to-r from-[#ff902b] to-[#ff7a00] text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-[#ff7a00] hover:to-[#ff6600] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          <ShoppingBag className="w-5 h-5" />
          Proceed to Checkout
        </button>
      )}

      {/* Trust Badges */}
      <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Shield className="w-5 h-5 mx-auto mb-2 text-green-600" />
          <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <RefreshCw className="w-5 h-5 mx-auto mb-2 text-blue-600" />
          <p className="text-xs font-semibold text-gray-700">30-Day Returns</p>
        </div>
      </div>
    </div>
  );
};