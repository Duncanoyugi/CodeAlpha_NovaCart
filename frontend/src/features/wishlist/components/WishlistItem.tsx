import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import type { WishlistItem as WishlistItemType } from '../../../types';
import { formatPrice, truncateText } from '../../../utils';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: () => void;
  onAddToCart: () => void;
}

export const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart }) => {
  return (
    <div className="grid gap-5 rounded-[var(--radius-2xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all lg:grid-cols-[1fr_280px] lg:items-center">
      <div className="flex items-start gap-5">
        <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="h-28 w-28 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-muted)] flex-shrink-0">
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="group/title">
            <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] group-hover/title:text-[var(--color-text-accent)] transition-colors leading-snug">
              {truncateText(item.product.name, 60)}
            </h2>
          </Link>
          <p className="text-xs font-ui text-[var(--color-text-tertiary)] mt-2 uppercase tracking-wider">{item.product.category?.name ?? ''}</p>
          {item.product.rating !== undefined && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(item.product.rating!) ? 'text-[var(--color-gold-400)]' : 'text-[var(--color-border-strong)]'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-ui font-medium text-[var(--color-text-primary)]">{Number(item.product.rating).toFixed(1)}</span>
              <span className="text-xs font-ui text-[var(--color-text-tertiary)]">({item.product.num_reviews})</span>
            </div>
          )}
          <p className="font-ui text-lg font-bold text-[var(--color-gold-600)] mt-3">{formatPrice(item.product.final_price)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:items-end">
        <button
          onClick={onAddToCart}
          className="btn-primary flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold shadow-[var(--shadow-gold)]"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
        <button
          onClick={onRemove}
          className="btn-outline flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-medium border-[var(--color-danger-border)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger-text)]"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
};