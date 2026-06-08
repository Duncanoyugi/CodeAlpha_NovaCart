import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { useGetFeaturedProductsQuery, useGetBestSellingProductsQuery, useGetNewArrivalsQuery, useGetCategoriesQuery } from '../features/products/api/productApi';
import { ROUTES } from '../utils/constants';
import { useCart } from '../features/cart';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useWishlist } from '../features/wishlist';

export const HomePage: React.FC = () => {
  const { data: featured = [], isLoading: featuredLoading } = useGetFeaturedProductsQuery();
  const { data: bestSelling = [], isLoading: bestSellingLoading } = useGetBestSellingProductsQuery();
  const { data: newArrivals = [], isLoading: newArrivalsLoading } = useGetNewArrivalsQuery();
  const categoriesData = useGetCategoriesQuery().data;
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.data ?? [];
  const { addItemToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { items: wishlistItems, addItem, removeItem, isInWishlist } = useWishlist();

  useEffect(() => { if (isAuthenticated) {} }, [isAuthenticated]);

  const normalize = (data: any): any[] => Array.isArray(data) ? data : data?.data ?? [];

  const featuredList = normalize(featured);
  const bestSellingList = normalize(bestSelling);
  const newArrivalsList = normalize(newArrivals);

  const handleAddToCart = (productId: string) => addItemToCart({ product_id: productId, quantity: 1 });
  const handleToggleWishlist = (productId: string) => isInWishlist(productId) ? removeItem(productId) : addItem(productId);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] overflow-hidden">
        <div className="container-normal py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold-400)] mb-6">New Collection 2026</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[68px] leading-[1.05] mb-6">
              Curated essentials for modern living
            </h1>
            <p className="font-ui text-base md:text-lg text-[rgba(240,235,224,0.6)] mb-8 max-w-lg">
              Discover our latest arrivals. Editorial curation meets quality craftsmanship.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={ROUTES.PRODUCTS} className="inline-flex items-center px-8 py-3.5 bg-[var(--color-gold-400)] text-[var(--color-gold-800)] font-ui text-[13px] font-bold uppercase tracking-[0.08em] rounded-[var(--radius-md)] hover:bg-[var(--color-gold-200)] transition-colors">
                Shop Now
              </Link>
              <Link to={ROUTES.PRODUCTS} className="inline-flex items-center px-8 py-3.5 border border-[rgba(240,235,224,0.2)] text-[var(--color-text-inverse)] font-ui text-[13px] font-bold uppercase tracking-[0.08em] rounded-[var(--radius-md)] hover:border-[var(--color-gold-400)] hover:text-[var(--color-gold-400)] transition-colors">
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
        {/* Stat bar */}
        <div className="border-t border-[rgba(240,235,224,0.08)]">
          <div className="container-normal py-6">
            <div className="grid grid-cols-3 gap-4">
              {['10K+ Products', 'Free Shipping', '30-Day Returns'].map((stat) => (
                <div key={stat} className="text-center">
                  <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[rgba(240,235,224,0.5)]">{stat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-gap">
        <div className="container-normal">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-sm)]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Browse</span>
                <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Top Categories</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat: any) => (
                <Link key={cat.id} to={`${ROUTES.PRODUCTS}?category=${cat.slug}`} className="group text-center p-5 rounded-[var(--radius-xl)] border border-[var(--color-border-light)] hover:border-[var(--color-gold-400)] hover:shadow-[var(--shadow-md)] transition-all">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-gold-50)] transition-colors">
                    <span className="text-lg">📦</span>
                  </div>
                  <span className="font-ui text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section-gap bg-[var(--color-bg-muted)]">
        <div className="container-normal">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Selection</span>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Featured Products</h2>
            </div>
            <Link to={ROUTES.PRODUCTS} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline">View All</Link>
          </div>
          <ProductGrid products={featuredList} isLoading={featuredLoading} onAddToCart={handleAddToCart} onAddToWishlist={handleToggleWishlist} wishlistIds={wishlistItems.map((i: any) => i.product.id)} />
        </div>
      </section>

      {/* Best Selling */}
      <section className="section-gap">
        <div className="container-normal">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Popular</span>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Best Sellers</h2>
            </div>
            <Link to={ROUTES.PRODUCTS} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline">View All</Link>
          </div>
          <ProductGrid products={bestSellingList.slice(0, 8)} isLoading={bestSellingLoading} onAddToCart={handleAddToCart} onAddToWishlist={handleToggleWishlist} wishlistIds={wishlistItems.map((i: any) => i.product.id)} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section-gap bg-[var(--color-bg-muted)]">
        <div className="container-normal">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Just Landed</span>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">New Arrivals</h2>
            </div>
            <Link to={ROUTES.PRODUCTS} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline">View All</Link>
          </div>
          <ProductGrid products={newArrivalsList} isLoading={newArrivalsLoading} onAddToCart={handleAddToCart} onAddToWishlist={handleToggleWishlist} wishlistIds={wishlistItems.map((i: any) => i.product.id)} />
        </div>
      </section>
    </div>
  );
};
