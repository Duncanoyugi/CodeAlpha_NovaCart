import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { ROUTES } from '../../utils/constants';
import { formatPrice, calculateDiscountPercentage } from '../../utils';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onRemoveFromWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist = false,
}) => {
  const discountPercentage = calculateDiscountPercentage(product.price, product.final_price);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="group bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-[var(--color-border-medium)]">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-muted)]">
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="block">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-[10px] font-body font-bold uppercase tracking-wider shadow-md">
              -{discountPercentage}%
            </span>
          )}
          {product.is_new_arrival && discountPercentage === 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-body font-bold uppercase tracking-wider shadow-md">
              New
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {(onAddToWishlist || onRemoveFromWishlist) && (
            <button
              onClick={() => {
                if (isInWishlist) {
                  onRemoveFromWishlist?.(product.id);
                } else {
                  onAddToWishlist?.(product.id);
                }
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isInWishlist
                  ? 'bg-[var(--color-danger)] text-white'
                  : 'bg-white/95 text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-danger)] backdrop-blur-sm'
              }`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          )}
          <Link
            to={ROUTES.PRODUCT_DETAIL(product.slug)}
            className="hidden group-hover:flex w-9 h-9 items-center justify-center rounded-full bg-white/95 text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-text-primary)] shadow-lg backdrop-blur-sm transition-all duration-200"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Add to Cart - Desktop Hover */}
        {onAddToCart && !isOutOfStock && (
          <button
            onClick={() => onAddToCart(product.id)}
            className="absolute bottom-0 left-0 right-0 z-10 w-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] py-3.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 flex items-center justify-center gap-2 hover:brightness-110 hidden sm:flex"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        )}

        {/* Add to Cart - Mobile */}
        {onAddToCart && !isOutOfStock && (
          <button
            onClick={() => onAddToCart(product.id)}
            className="sm:hidden w-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] py-2.5 text-[11px] font-body font-bold uppercase tracking-[0.12em] rounded-[var(--radius-md)] hover:brightness-110 transition-all mt-3"
          >
            Add to Cart
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <Link
          to={ROUTES.CATEGORY(product.category.slug)}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] font-body font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors inline-block mb-1.5"
        >
          {product.category.name}
        </Link>

        {/* Product Name */}
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="group/title block">
          <h3 className="font-display text-[15px] font-normal text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover/title:text-[var(--color-primary)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? 'text-[var(--color-accent)]' : 'text-[var(--color-border-strong)]'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[11px] font-body font-medium text-[var(--color-text-primary)]">{Number(product.rating).toFixed(1)}</span>
          <span className="text-[11px] font-body text-[var(--color-text-muted)]">({product.num_reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end gap-2.5">
          <span className="font-body text-lg font-semibold text-[var(--color-primary)] leading-none">
            {formatPrice(product.final_price)}
          </span>
          {discountPercentage > 0 && (
            <span className="font-body text-xs text-[var(--color-text-muted)] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3">
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">Out of Stock</Badge>
          ) : product.stock_quantity < 5 ? (
            <Badge variant="warning" size="sm">Low Stock</Badge>
          ) : (
            <Badge variant="success" size="sm">In Stock</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;