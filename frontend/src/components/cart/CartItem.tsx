import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { formatPrice } from '../../utils';
import { ROUTES } from '../../utils/constants';
import toast from 'react-hot-toast';

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
    const id = item.id;
    onRemove(id);
    toast.success('Item removed');
  };

  return (
    <div className={`flex gap-4 sm:gap-6 py-6 border-b border-[var(--color-border)] transition-all duration-300 ${isRemoving ? 'opacity-40 scale-[0.98]' : ''}`}>
      {/* Product Image */}
      <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="sm:w-24 sm:h-24 flex-shrink-0 group/img">
        <div className="w-20 h-24 sm:w-24 sm:h-24 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)}>
              <h3 className="font-display text-base font-normal text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                {item.product.name}
              </h3>
            </Link>
            {item.variant && (
              <p className="text-xs font-body text-[var(--color-text-muted)] mt-1.5">
                Variant: <span className="text-[var(--color-text-secondary)] font-medium">{item.variant.name}</span>
              </p>
            )}
            <p className="text-[11px] font-body text-[var(--color-text-muted)] mt-1.5 font-mono">SKU: {item.product.sku}</p>
          </div>

          {/* Price */}
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="font-body text-base font-semibold text-[var(--color-primary)]">
              {formatPrice(item.subtotal)}
            </p>
            {quantity > 1 && (
              <p className="text-[11px] font-body text-[var(--color-text-muted)] mt-0.5">
                {formatPrice(item.product.final_price)} each
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2">
            <div className="flex items-center border-2 border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)]">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-l-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-body text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating || quantity >= item.product.stock_quantity}
                className="w-9 h-9 flex items-center justify-center rounded-r-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-all font-body text-xs uppercase tracking-[0.06em] font-medium active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;