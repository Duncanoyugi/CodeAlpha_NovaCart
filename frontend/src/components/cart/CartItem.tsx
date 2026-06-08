import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { formatPrice } from '../../utils';
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
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stock_quantity) return;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    onRemove(item.id);
  };

  return (
    <div className={`flex gap-4 sm:gap-6 py-6 border-b border-[var(--color-border-light)] transition-opacity duration-300 ${isRemoving ? 'opacity-40' : ''}`}>
      {/* Product Image */}
      <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="sm:w-24 sm:h-24 flex-shrink-0">
        <img
          src={item.product.image_url}
          alt={item.product.name}
          className="w-20 h-24 object-cover rounded-[var(--radius-md)] border border-[var(--color-border-light)]"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)}>
              <h3 className="font-display text-base font-normal text-[var(--color-text-primary)] leading-snug line-clamp-2 hover:text-[var(--color-text-accent)] transition-colors">
                {item.product.name}
              </h3>
            </Link>
            {item.variant && (
              <p className="text-xs font-ui text-[var(--color-text-tertiary)] mt-1">
                Variant: <span className="text-[var(--color-text-secondary)]">{item.variant.name}</span>
              </p>
            )}
            <p className="text-[11px] font-ui text-[var(--color-text-tertiary)] mt-1">SKU: {item.product.sku}</p>
          </div>

          {/* Price */}
          <div className="text-left sm:text-right">
            <p className="font-ui text-base font-medium text-[var(--color-gold-600)]">
              {formatPrice(item.subtotal)}
            </p>
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-ui text-sm font-medium text-[var(--color-text-primary)]">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= item.product.stock_quantity}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="flex items-center gap-2 text-[var(--color-danger-text)] hover:text-[var(--color-danger-text)] transition-colors font-ui text-xs uppercase tracking-[0.06em]"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
