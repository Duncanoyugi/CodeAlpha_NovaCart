import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { ProductFilters } from '../../../components/product/ProductFilters';
import { ProductSort } from '../../../components/product/ProductSort';
import { Pagination } from '../../../components/common/Pagination';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/productApi';
import { ROUTES } from '../../../utils/constants';
import { SORT_OPTIONS, FILTERS, PAGINATION } from '../../../utils/constants';
import { useProductFilters } from '../hooks/useProductFilters';
import { useCart } from '../../cart';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWishlist } from '../../wishlist';
import { Button } from '../../../components/common/Button';

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawCategories = useGetCategoriesQuery().data;
  const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories as any)?.data ?? [];

  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || SORT_OPTIONS[0].value;
  const initialSearch = searchParams.get('search') || '';
  const initialMinPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
  const initialMaxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
  const initialRating = searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined;

  const {
    filters,
    setFilters,
    handleSortChange,
    handleCategoryChange,
    handlePriceChange,
    handleRatingChange,
    handleAvailabilityChange,
    handlePageChange,
    clearAllFilters,
  } = useProductFilters({
    category: initialCategory,
    sort_by: initialSort,
    search: initialSearch,
    min_price: initialMinPrice,
    max_price: initialMaxPrice,
    min_rating: initialRating,
    page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
    page_size: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading } = useGetProductsQuery(filters as any);
  const products = (data as any)?.data ?? [];
  const pagination = (data as any)?.pagination ?? { total_pages: 1, current_page: 1, total_count: 0 };
  const { isAuthenticated } = useAuth();
  const { addItemToCart } = useCart();
  const { items: wishlistItems, addItem, removeItem, isInWishlist } = useWishlist();

  useEffect(() => {
    if (isAuthenticated) {}
  }, [isAuthenticated]);

  const handleAddToCart = (productId: string) => addItemToCart({ product_id: productId, quantity: 1 });
  const handleToggleWishlist = (productId: string) => isInWishlist(productId) ? removeItem(productId) : addItem(productId);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Shop</span>
        <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">All Products</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
            <ProductFilters
              categories={categories}
              selectedCategory={filters.category}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onRatingChange={handleRatingChange}
              onAvailabilityChange={handleAvailabilityChange}
              onClearFilters={clearAllFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setIsMobileFiltersOpen(true)} className="lg:hidden">
                Filters
              </Button>
              <span className="font-ui text-sm text-[var(--color-text-secondary)]">
                {(pagination as any).total_count ?? products.length} products
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ProductSort options={SORT_OPTIONS} value={filters.sort_by} onChange={handleSortChange} />
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            wishlistIds={wishlistItems.map((i: any) => i.product.id)}
          />

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={(page) => handlePageChange(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--color-bg-surface)] shadow-[var(--shadow-xl)] overflow-y-auto">
            <div className="p-4 border-b border-[var(--color-border-light)] flex justify-between items-center">
              <h3 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <ProductFilters
              categories={categories}
              selectedCategory={filters.category}
              onCategoryChange={(id) => { handleCategoryChange(id); }}
              onPriceChange={handlePriceChange}
              onRatingChange={handleRatingChange}
              onAvailabilityChange={handleAvailabilityChange}
              onClearFilters={() => { clearAllFilters(); }}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
};