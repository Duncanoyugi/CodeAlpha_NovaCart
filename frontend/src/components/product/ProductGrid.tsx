import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  wishlistIds?: string[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  wishlistIds = [],
}) => {
  const productList = React.useMemo<Product[]>(() => {
    if (!products) return [];
    if (Array.isArray(products)) return products;
    if ((products as any).results && Array.isArray((products as any).results)) return (products as any).results;
    if ((products as any).data && Array.isArray((products as any).data)) return (products as any).data;
    return [];
  }, [products]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)] overflow-hidden">
            <div className="aspect-[4/5] bg-[var(--color-bg-muted)] skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-[var(--color-bg-muted)] rounded skeleton w-1/3" />
              <div className="h-4 bg-[var(--color-bg-muted)] rounded skeleton w-full" />
              <div className="h-3 bg-[var(--color-bg-muted)] rounded skeleton w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (productList.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl text-[var(--color-text-primary)] mb-2">No products found</p>
        <p className="font-ui text-sm text-[var(--color-text-secondary)]">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productList.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isInWishlist={wishlistIds.includes(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
