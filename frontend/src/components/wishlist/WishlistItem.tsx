import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import type { WishlistItem as WishlistItemType } from '../../types';
import { formatPrice, truncateText } from '../../utils';
import { ROUTES } from '../../utils/constants';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  isAddingToCart?: boolean;
}

export const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  onRemove,
  onAddToCart,
  isAddingToCart = false,
}) => {
  const { product } = item;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="sm:w-32">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-32 object-cover rounded-lg"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div>
            <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
              <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition">
                {truncateText(product.name, 60)}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              SKU: {product.sku}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-gray-800">
              {formatPrice(product.final_price)}
            </p>
            {product.compare_price && product.compare_price > product.final_price && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </p>
            )}
          </div>
        </div>

        {/* Stock Status & Actions */}
        <div className="flex items-center justify-between mt-4">
          <div>
            {isOutOfStock ? (
              <span className="text-sm text-red-500">Out of Stock</span>
            ) : (
              <span className="text-sm text-green-600">
                In Stock ({product.stock_quantity} available)
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={isOutOfStock || isAddingToCart}
              className="text-primary-600 hover:text-primary-700 transition flex items-center gap-1 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Add to Cart</span>
            </button>
            <button
              onClick={() => onRemove(product.id)}
              className="text-red-500 hover:text-red-700 transition flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};