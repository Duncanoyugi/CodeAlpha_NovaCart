import React from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  wishlistIds?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  wishlistIds = [],
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search terms to find what you\'re looking for.',
  onClearFilters,
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
          <div key={index} className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden">
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
      <EmptyState
        icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onClearFilters ? 'Clear Filters' : undefined}
        actionOnClick={onClearFilters}
      />
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
