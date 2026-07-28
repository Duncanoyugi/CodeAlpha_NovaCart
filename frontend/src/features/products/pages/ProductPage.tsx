import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BatteryCharging, Cable, ChevronRight, Headphones, Search, SlidersHorizontal, Sparkles, Watch, X } from 'lucide-react';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { ProductFilters } from '../../../components/product/ProductFilters';
import { ProductSort } from '../../../components/product/ProductSort';
import { Pagination } from '../../../components/common/Pagination';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/productApi';
import { SORT_OPTIONS, PAGINATION } from '../../../utils/constants';
import { useProductFilters } from '../hooks/useProductFilters';
import { useCart } from '../../cart';
import { useWishlist } from '../../wishlist';
import { Button } from '../../../components/common/Button';

const categoryIcons: Record<string, React.ReactNode> = {
  'chargers-cables': <Cable className="w-5 h-5" />,
  pods: <Headphones className="w-5 h-5" />,
  'power-banks': <BatteryCharging className="w-5 h-5" />,
  'smart-watches': <Watch className="w-5 h-5" />,
  shavers: <Sparkles className="w-5 h-5" />,
  'earphones-headphones': <Headphones className="w-5 h-5" />,
  brands: <Sparkles className="w-5 h-5" />,
};

export const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawCategories = useGetCategoriesQuery().data;
  const categories = (Array.isArray(rawCategories) ? rawCategories : (rawCategories as any)?.data ?? [])
    .filter((category: any) => !category.parent);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const {
    filters, setFilters, handleSortChange, handleCategoryChange, handlePriceChange,
    handleRatingChange, handleAvailabilityChange, handlePageChange, clearAllFilters,
  } = useProductFilters({
    category: searchParams.get('category') || '',
    sort_by: searchParams.get('sort') || SORT_OPTIONS[0].value,
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
    page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
    page_size: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading } = useGetProductsQuery(filters as any);
  const products = (data as any)?.data?.products ?? [];
  const pagination = (data as any)?.data?.pagination ?? { total_pages: 1, current_page: 1, total_count: 0 };
  const { addItemToCart } = useCart();
  const { items: wishlistItems, addItem, removeItem, isInWishlist } = useWishlist();
  const selectedCategory = categories.find((category: any) => category.id === filters.category);
  const activeFilterCount = [filters.category, filters.search, filters.min_price, filters.max_price, filters.min_rating, filters.in_stock]
    .filter((value) => value !== undefined && value !== '').length;
  const heading = filters.search ? `Results for “${filters.search}”` : selectedCategory?.name || 'Shop Playhouse';

  const selectCategory = (id: string) => handleCategoryChange(id);
  const removeSearch = () => setFilters({ ...filters, search: '', page: 1 });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pb-16">
      <section className="relative overflow-hidden bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)]">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, #0f6e51 0, transparent 36%), radial-gradient(circle at 88% 10%, #f2a93b 0, transparent 22%)' }} />
        <div className="relative container-custom pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="flex items-center gap-2 text-[11px] font-body font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            <Sparkles className="w-3.5 h-3.5" /> Curated tech for everyday life
          </div>
          <div className="mt-4 max-w-3xl">
            <h1 className="font-display text-4xl leading-tight md:text-6xl">{heading}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 md:text-base">Find dependable charging, audio, power and smart essentials from brands you trust.</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-body text-white/70">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">Genuine accessories</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">Easy product discovery</span>
          </div>
        </div>
      </section>

      <div className="container-custom">
        <section className="relative -mt-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-lg)] md:p-4">
          <div className="mb-2 flex items-center justify-between px-2 pt-1">
            <p className="text-[10px] font-body font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Browse collections</p>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button onClick={() => selectCategory('')} className={`shrink-0 rounded-[var(--radius-lg)] px-4 py-3 text-left text-sm font-body font-semibold transition-all ${!filters.category ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-gold)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]'}`}>All products</button>
            {categories.map((category: any) => <button key={category.id} onClick={() => selectCategory(category.id)} className={`flex shrink-0 items-center gap-2 rounded-[var(--radius-lg)] px-4 py-3 text-left text-sm font-body font-semibold transition-all ${filters.category === category.id ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-gold)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]'}`}>
              {categoryIcons[category.slug] || <Sparkles className="w-5 h-5" />}{category.name}
            </button>)}
          </div>
        </section>

        <section className="pt-10">
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-body text-[var(--color-text-secondary)]"><span className="font-semibold text-[var(--color-text-primary)]">{pagination.total_count ?? products.length}</span> products available</p>
              {activeFilterCount > 0 && <div className="mt-3 flex flex-wrap gap-2">
                {filters.search && <button onClick={removeSearch} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-body font-semibold text-[var(--color-primary)]">Search: {filters.search}<X className="w-3.5 h-3.5" /></button>}
                {selectedCategory && <button onClick={() => selectCategory('')} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-body font-semibold text-[var(--color-primary)]">{selectedCategory.name}<X className="w-3.5 h-3.5" /></button>}
                <button onClick={clearAllFilters} className="px-2 py-1.5 text-xs font-body font-semibold text-[var(--color-danger)] hover:underline">Clear all</button>
              </div>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsMobileFiltersOpen(true)} className="lg:hidden gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters{activeFilterCount > 0 && <span className="rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] text-white">{activeFilterCount}</span>}</Button>
              <ProductSort options={SORT_OPTIONS} value={filters.sort_by} onChange={handleSortChange} />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="hidden w-72 shrink-0 lg:block"><div className="sticky top-24"><div className="mb-3 flex items-center justify-between px-1"><h2 className="font-display text-lg text-[var(--color-text-primary)]">Refine results</h2>{activeFilterCount > 0 && <button onClick={clearAllFilters} className="text-xs font-body font-semibold text-[var(--color-primary)] hover:underline">Reset</button>}</div><ProductFilters categories={categories} selectedCategory={filters.category} onCategoryChange={selectCategory} onPriceChange={handlePriceChange} onRatingChange={handleRatingChange} onAvailabilityChange={handleAvailabilityChange} onClearFilters={clearAllFilters} /></div></aside>
            <div className="min-w-0 flex-1"><ProductGrid products={products} isLoading={isLoading} onAddToCart={(id) => addItemToCart({ product_id: id, quantity: 1 })} onAddToWishlist={(id) => isInWishlist(id) ? removeItem(id) : addItem(id)} wishlistIds={wishlistItems.map((item: any) => item.product.id)} onClearFilters={clearAllFilters} />
              {pagination.total_pages > 1 && <div className="mt-12 flex justify-center"><Pagination currentPage={pagination.current_page} totalPages={pagination.total_pages} onPageChange={handlePageChange} /></div>}
            </div>
          </div>
        </section>
      </div>

      {isMobileFiltersOpen && <div className="fixed inset-0 z-[60] lg:hidden"><button className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm" aria-label="Close filters" onClick={() => setIsMobileFiltersOpen(false)} /><div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-2xl)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)]"><div className="sticky top-0 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4"><div><p className="font-display text-lg text-[var(--color-text-primary)]">Filter products</p><p className="text-xs text-[var(--color-text-muted)]">Find exactly what you need</p></div><button onClick={() => setIsMobileFiltersOpen(false)} className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"><X className="w-5 h-5" /></button></div><ProductFilters categories={categories} selectedCategory={filters.category} onCategoryChange={selectCategory} onPriceChange={handlePriceChange} onRatingChange={handleRatingChange} onAvailabilityChange={handleAvailabilityChange} onClearFilters={clearAllFilters} isMobile /></div></div>}
    </main>
  );
};
