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
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="sm:w-32">
        <img
          src={item.product.image_url}
          alt={item.product.name}
          className="w-full h-32 object-cover rounded-lg"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div>
            <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)}>
              <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition">
                {truncateText(item.product.name, 60)}
              </h3>
            </Link>
            {item.variant && (
              <p className="text-sm text-gray-500 mt-1">
                Variant: {item.variant.name}
              </p>
            )}
            <p className="text-sm text-gray-500">
              SKU: {item.product.sku}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-gray-800">
              {formatPrice(item.subtotal)}
            </p>
            {hasSavings && (
              <p className="text-xs text-green-600">
                Saved: {formatPrice(item.savings)}
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls & Remove Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= item.product.stock_quantity}
              className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 ml-2">
              {item.product.stock_quantity} available
            </span>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-red-500 hover:text-red-700 transition flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};