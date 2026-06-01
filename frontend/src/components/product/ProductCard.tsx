import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { formatPrice, calculateDiscountPercentage, truncateText } from '../../utils';
import { ROUTES } from '../../utils/constants';

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
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasDiscount = product.discount_percentage > 0;
  const discountPercentage = calculateDiscountPercentage(product.price, product.final_price);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercentage}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => onAddToWishlist?.(product.id)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md transition-all duration-200 ${
          isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
      </button>

      {/* Product Image */}
      <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <Link
          to={ROUTES.CATEGORY(product.category.slug)}
          className="text-xs text-gray-500 mb-1 inline-block hover:text-primary-600"
        >
          {product.category.name}
        </Link>

        {/* Product Name */}
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2">
            {truncateText(product.name, 50)}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium ml-1">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-400">({product.num_reviews} reviews)</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(product.final_price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {isOutOfStock ? (
          <p className="mt-2 text-sm text-red-500 font-medium">Out of Stock</p>
        ) : (
          <p className="mt-2 text-xs text-green-600">
            In Stock ({product.stock_quantity} available)
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(product.id)}
          disabled={isOutOfStock}
          className={`mt-4 w-full py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};