import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { formatPrice, truncateText } from '../../utils';
import { ROUTES } from '../../utils/constants';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isUpdating?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock_quantity) return;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const hasSavings = item.savings > 0;

  return (
    <div className="p-6 hover:shadow-sm transition">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Product Image */}
        <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="sm:w-40 flex-shrink-0">
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-40 object-cover rounded-2xl border border-gray-200"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex-1">
              <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-[#ff902b] transition">
                  {truncateText(item.product.name, 60)}
                </h3>
              </Link>
              {item.variant && (
                <p className="text-sm text-gray-600 mt-2">
                  Variant: <span className="font-medium">{item.variant.name}</span>
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">SKU: {item.product.sku}</p>
              <p className="text-xs text-green-600 font-medium mt-2">
                ✓ In Stock ({item.product.stock_quantity} available)
              </p>
            </div>

            {/* Price & Savings */}
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(item.subtotal)}
              </p>
              {hasSavings && (
                <p className="text-sm text-green-600 font-semibold mt-1">
                  Saved: {formatPrice(item.savings)}
                </p>
              )}
            </div>
          </div>

          {/* Quantity Controls & Remove Button */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating || quantity >= item.product.stock_quantity}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-700 transition flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};