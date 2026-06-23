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
import { SlidersHorizontal } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawCategories = useGetCategoriesQuery().data;
  const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories as any)?.data ?? [];
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
  const products = (data as any)?.data?.products ?? [];
  const pagination = (data as any)?.data?.pagination ?? (data as any)?.pagination ?? { total_pages: 1, current_page: 1, total_count: 0 };
  const { isAuthenticated } = useAuth();
  const { addItemToCart } = useCart();
  const { items: wishlistItems, addItem, removeItem, isInWishlist } = useWishlist();

  useEffect(() => {
    if (isAuthenticated) {}
  }, [isAuthenticated]);

  const handleAddToCart = (productId: string) => addItemToCart({ product_id: productId, quantity: 1 });
  const handleToggleWishlist = (productId: string) => isInWishlist(productId) ? removeItem(productId) : addItem(productId);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)] font-semibold">Shop</span>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">
            {initialSearch ? `Search: "${initialSearch}"` : 'All Products'}
          </h1>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-2">
            {(pagination as any).total_count ?? products.length} products found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
          <ProductSort options={SORT_OPTIONS} value={filters.sort_by} onChange={handleSortChange} />
        </div>
      </div>

      {/* Active Filters */}
      {(initialCategory || initialSearch || initialRating || initialMinPrice || initialMaxPrice) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="font-ui text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Active:</span>
          {initialSearch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-gold-50)] border border-[var(--color-gold-100)] text-xs font-ui font-medium text-[var(--color-gold-700)]">
              Search: {initialSearch}
              <button onClick={() => { setFilters({ ...filters, search: '', page: 1 }); }} className="hover:text-[var(--color-danger-text)]">×</button>
            </span>
          )}
          {initialCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-gold-50)] border border-[var(--color-gold-100)] text-xs font-ui font-medium text-[var(--color-gold-700)]">
              {categories.find((c: any) => c.id === initialCategory)?.name || 'Category'}
              <button onClick={() => handleCategoryChange('')} className="hover:text-[var(--color-danger-text)]">×</button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-ui text-[var(--color-danger-text)] hover:underline font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
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
            <div className="mt-10 flex justify-center">
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--color-bg-surface)] shadow-[var(--shadow-elevated)] overflow-y-auto">
            <div className="p-4 border-b border-[var(--color-border-light)] flex justify-between items-center sticky top-0 bg-[var(--color-bg-surface)] z-10">
              <h3 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] rounded-full transition-all">
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