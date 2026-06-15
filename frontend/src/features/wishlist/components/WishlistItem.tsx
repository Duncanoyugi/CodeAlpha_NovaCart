import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import type { WishlistItem as WishlistItemType } from '../../../types';
import { formatPrice, truncateText } from '../../../utils';
import { ROUTES } from '../../../utils/constants';

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: () => void;
  onAddToCart: () => void;
}

export const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart }) => {
  return (
    <div className="grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 lg:grid-cols-[1fr_260px] lg:items-center">
      <div className="flex items-start gap-4">
        <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="h-28 w-28 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        </Link>
        <div>
          <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)}>
            <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition">
              {truncateText(item.product.name, 60)}
            </h2>
          </Link>
          <p className="text-sm text-gray-500 mt-2">{item.product.category.name}</p>
          {item.product.rating !== undefined && (
            <p className="mt-3 text-sm text-gray-600">Rating: <span className="font-semibold text-gray-900">{Number(item.product.rating).toFixed(1)} ★</span></p>
          )}
          <p className="mt-3 text-lg font-semibold text-primary-600">{formatPrice(item.product.final_price)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <button
          onClick={onAddToCart}
          className="btn-primary flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
        <button
          onClick={onRemove}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-red-300 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
};