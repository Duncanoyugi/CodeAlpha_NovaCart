import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { ROUTES } from '../../utils/constants';
import { formatPrice, calculateDiscountPercentage } from '../../utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
}) => {
  const discountPercentage = calculateDiscountPercentage(product.price, product.final_price);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="group relative bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] transition-all duration-300 hover:border-[var(--color-border-medium)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[2px]">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[var(--radius-lg)]">
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-[var(--color-gold-400)] text-[var(--color-gold-800)] text-[11px] font-bold px-2 py-1 rounded-[var(--radius-sm)]">
            -{discountPercentage}%
          </div>
        )}

        {/* New Badge */}
        {product.is_new_arrival && discountPercentage === 0 && (
          <div className="absolute top-3 left-3 z-10 bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] text-[11px] font-bold px-2 py-1 rounded-[var(--radius-sm)]">
            NEW
          </div>
        )}

        {/* Wishlist Heart */}
        {onAddToWishlist && (
          <button
            onClick={() => onAddToWishlist(product.id)}
            className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
              isInWishlist
                ? 'bg-[rgba(231,76,60,0.9)] text-white'
                : 'bg-[rgba(255,255,255,0.9)] text-[var(--color-text-secondary)] hover:text-[#E74C3C]'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Add to Cart - Hover (Desktop) */}
        {onAddToCart && !isOutOfStock && (
          <button
            onClick={() => onAddToCart(product.id)}
            className="absolute bottom-0 left-0 right-0 z-10 w-full bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] py-2.5 text-[11px] font-ui uppercase tracking-[0.1em] font-bold transition-all duration-300"
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
          className="text-[11px] font-ui uppercase tracking-[0.12em] text-[var(--color-text-tertiary)] hover:text-[var(--color-gold-600)] transition-colors inline-block mb-1"
        >
          {product.category.name}
        </Link>

        {/* Product Name */}
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="font-display text-[15px] font-normal text-[var(--color-text-primary)] leading-snug line-clamp-2 hover:text-[var(--color-text-accent)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            <svg className="w-3.5 h-3.5 text-[var(--color-gold-400)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[11px] font-ui font-medium text-[var(--color-text-primary)] ml-1">{Number(product.rating).toFixed(1)}</span>
          </div>
          <span className="text-[11px] font-ui text-[var(--color-text-tertiary)]">({product.num_reviews} reviews)</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-ui text-sm font-medium text-[var(--color-gold-600)]">
            {formatPrice(product.final_price)}
          </span>
          {discountPercentage > 0 && (
            <span className="font-ui text-[11px] text-[var(--color-text-tertiary)] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {isOutOfStock ? (
          <p className="mt-2 text-[11px] font-ui text-[var(--color-danger-text)]">Out of Stock</p>
        ) : (
          <p className="mt-2 text-[11px] font-ui text-[var(--color-success-text)]">In Stock</p>
        )}

        {/* Mobile Add to Cart */}
        {onAddToCart && !isOutOfStock && (
          <button
            onClick={() => onAddToCart(product.id)}
            className="mt-3 w-full bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] py-2 text-[11px] font-ui uppercase tracking-[0.1em] font-bold rounded-[var(--radius-md)] hover:bg-[rgba(240,235,224,0.9)] hover:text-[var(--color-bg-inverse)] transition-colors md:hidden"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
