import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../utils';
import { ROUTES } from '../../utils/constants';
import { Button } from '../common/Button';

interface WishlistItemProps {
  item: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      image_url: string;
      sku: string;
      stock_quantity: number;
      final_price: number;
      price: number;
      discount_percentage: number;
    };
  };
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
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-[var(--color-border-light)]">
      <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="sm:w-24 flex-shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-28 object-cover rounded-[var(--radius-md)] border border-[var(--color-border-light)]"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div>
            <Link to={ROUTES.PRODUCT_DETAIL(product.slug)}>
              <h3 className="font-display text-base font-normal text-[var(--color-text-primary)] line-clamp-1 hover:text-[var(--color-text-accent)] transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="font-ui text-[11px] text-[var(--color-text-tertiary)] mt-1">SKU: {product.sku}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-ui text-sm font-medium text-[var(--color-gold-600)]">{formatPrice(product.final_price)}</p>
            {product.discount_percentage > 0 && (
              <p className="font-ui text-[11px] text-[var(--color-text-tertiary)] line-through">{formatPrice(product.price)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            {isOutOfStock ? (
              <span className="font-ui text-xs text-[var(--color-danger-text)]">Out of Stock</span>
            ) : (
              <span className="font-ui text-xs text-[var(--color-success-text)]">In Stock ({product.stock_quantity})</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddToCart(product.id)} disabled={isOutOfStock || isAddingToCart} className="text-xs">
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Add to Cart
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onRemove(product.id)} className="text-xs text-[var(--color-danger-text)]">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
