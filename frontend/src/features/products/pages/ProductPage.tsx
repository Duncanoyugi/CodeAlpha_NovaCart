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
        {/* Hero Section */}
        <div className="rounded-3xl bg-gradient-to-r from-[#2b2350] to-[#3d2f60] text-white p-8 mb-8 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff902b]">Shop</p>
            <h1 className="mt-3 text-4xl font-bold">Explore Our Collections</h1>
            <p className="mt-3 text-white/80">Browse trending products, filter by category, and discover the best deals tailored for you.</p>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#ff902b] text-white px-5 py-2 text-sm font-bold">
              {products.length} items
            </div>
            <p className="text-gray-600">Available in our store</p>
          </div>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 transition"
          >
            ☰ Filters
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900">Refine Search</h2>
              <p className="mt-2 text-sm text-gray-600">Find exactly what you're looking for.</p>
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

          {/* Main Content */}
          <div>
            {/* Search & Sort */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                      className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-5 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-[#ff902b] focus:bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700">
                    Sorted by: <span className="ml-2 font-bold text-gray-900">{sortOptions.find((option) => option.value === filters.sort_by)?.label}</span>
                  </span>
                  <ProductSort
                    options={sortOptions}
                    value={filters.sort_by}
                    onChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleToggleWishlist}
                wishlistIds={wishlistItems.map((item) => item.product.id)}
              />
            </div>

            {/* Pagination */}
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

        {/* Mobile Filters Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-500 text-2xl">✕</button>
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
      </div>
    </MainLayout>
  );
};