import React, { useEffect, useState } from 'react';
import { useGetCategoriesQuery } from '../api/productApi';
import { ProductGrid, ProductFilters, ProductSort } from '../index';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../../cart';
import { useWishlist } from '../../wishlist';
import { useAuth } from '../../auth/hooks/useAuth';
import { Pagination } from '../../../components/common/Pagination';
import { MainLayout } from '../../../layouts/MainLayout';

export const ProductsPage: React.FC = () => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData && typeof categoriesData === 'object'
      ? (categoriesData as any).data ?? []
      : [];
  const { products, isLoading, pagination } = useProducts();
  const {
    filters,
    sortOptions,
    applyFilters,
    handleSearchChange,
    handlePriceChange,
    handleSortChange,
    handleCategoryChange,
    handleRatingChange,
    handleAvailabilityChange,
    handlePageChange,
    clearAllFilters,
  } = useProductFilters();
  const { isAuthenticated } = useAuth();
  const { getCart, addItemToCart } = useCart();
  const { items: wishlistItems, getWishlist, addItem, removeItem, isInWishlist } = useWishlist();

  useEffect(() => {
    getCart();
    if (isAuthenticated) {
      getWishlist();
    }
  }, [getCart, getWishlist, isAuthenticated]);

  const handleAddToCart = (productId: string) => {
    addItemToCart({ product_id: productId, quantity: 1 });
  };

  const handleToggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeItem(productId);
    } else {
      addItem(productId);
    }
  };

  // Apply filters on mount and when filters change
  useEffect(() => {
    applyFilters();
  }, [filters.page, filters.sort_by, filters.category]);

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-600">Shop</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Explore the latest collections</h1>
            <p className="mt-3 max-w-2xl text-gray-500">Browse trending products, filter by category, and discover the best deals for your cart.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-3xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
              {products.length} items available
            </div>
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="hidden lg:inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
            >
              Filter Products
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Refine results</h2>
              <p className="mt-2 text-sm text-gray-500">Find the perfect product faster with our curated filters.</p>
              <div className="mt-6">
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
            </div>
          </aside>

          <div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-1 min-w-0">
                  <label htmlFor="product-search" className="sr-only">Search products</label>
                  <div className="relative">
                    <input
                      id="product-search"
                      type="text"
                      placeholder="Search products, brands, or keywords"
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                      className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">
                    Sorted by <span className="ml-2 font-semibold text-gray-900">{sortOptions.find((option) => option.value === filters.sort_by)?.label}</span>
                  </span>
                  <ProductSort
                    options={sortOptions}
                    value={filters.sort_by}
                    onChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                wishlistIds={wishlistItems.map((item) => item.product.id)}
              />
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

          {/* Mobile Filters Modal */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-500">
                    ✕
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  selectedCategory={filters.category}
                  onCategoryChange={handleCategoryChange}
                  onPriceChange={handlePriceChange}
                  onRatingChange={handleRatingChange}
                  onAvailabilityChange={handleAvailabilityChange}
                  onClearFilters={clearAllFilters}
                  isMobile
                />
              </div>
            </div>
          )}
    </MainLayout>
  );
};