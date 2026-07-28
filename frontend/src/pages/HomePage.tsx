import React from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { useGetFeaturedProductsQuery, useGetBestSellingProductsQuery, useGetNewArrivalsQuery, useGetCategoriesQuery } from '../features/products/api/productApi';
import { ROUTES } from '../utils/constants';
import { useCart } from '../features/cart';
import { useWishlist } from '../features/wishlist';

export const HomePage: React.FC = () => {
  const { data: featured = [], isLoading: featuredLoading } = useGetFeaturedProductsQuery();
  const { data: bestSelling = [], isLoading: bestSellingLoading } = useGetBestSellingProductsQuery();
  const { data: newArrivals = [], isLoading: newArrivalsLoading } = useGetNewArrivalsQuery();
  const categoriesData = useGetCategoriesQuery().data;
  const categories = (Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.data ?? [])
    .filter((category: any) => !category.parent);
  const { addItemToCart } = useCart();
  const { items: wishlistItems, addItem, removeItem, isInWishlist } = useWishlist();

  const normalize = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const featuredList = normalize(featured);
  const bestSellingList = normalize(bestSelling);
  const newArrivalsList = normalize(newArrivals);

  const handleAddToCart = (productId: string) => addItemToCart({ product_id: productId, quantity: 1 });
  const handleToggleWishlist = (productId: string) => (isInWishlist(productId) ? removeItem(productId) : addItem(productId));
  const wishlistIds = wishlistItems.map((i: any) => i.product.id);

  return (
    <div>
      {/* Hero */}
      <section className="relative w-full min-h-[500px] md:min-h-[400px] lg:min-h-[450px] bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/image2.jpg" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container-normal py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-block font-body text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6">
              Playhouse Electronics
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-[70px] leading-[1.1] mb-6">
              Smart charging,
              <br />
              audio and power for everyday life
            </h1>
            <p className="font-body text-lg md:text-xl text-[rgba(240,235,224,0.7)] mb-8 max-w-lg">
              Discover Oraimo, Amaya, Samsung and more through a clear Playhouse catalog built for easy browsing and fast product discovery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={ROUTES.PRODUCTS}
                className="inline-flex items-center px-8 py-3.5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-body text-[13px] font-bold uppercase tracking-[0.08em] rounded-[var(--radius-lg)] hover:brightness-110 active:scale-[0.98] transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-inverse)]"
              >
                Shop Now
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                className="inline-flex items-center px-8 py-3.5 border-2 border-white/30 text-white font-body text-[13px] font-bold uppercase tracking-[0.08em] rounded-[var(--radius-lg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                View Lookbook
              </Link>
            </div>
          </div>
        </div>

        {/* Stat bar */}
        <div className="border-t border-[rgba(240,235,224,0.1)]">
          <div className="container-normal py-5">
            <div className="grid grid-cols-3 gap-4">
              {['10K+ Products', 'Free Shipping', '30-Day Returns'].map((stat) => (
                <div key={stat} className="text-center">
                  <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[rgba(240,235,224,0.6)]">
                    {stat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-gap">
        <div className="container-normal">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-primary)] font-semibold">
                  Browse
                </span>
                <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Playhouse Categories</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
                  className="group text-center p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card-hover)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-primary)]/10 transition-colors">
                    <span className="text-lg" aria-hidden="true"></span>
                  </div>
                  <span className="font-body text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                    {cat.name}
                  </span>
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
              <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-primary)] font-semibold">
                Selection
              </span>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Featured Products</h2>
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="font-body text-sm text-[var(--color-primary)] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
            >
              View All
            </Link>
          </div>
          <ProductGrid
            products={featuredList}
            isLoading={featuredLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        </div>
      </section>

      {/* Best Selling */}
      <section className="section-gap">
        <div className="container-normal">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-primary)] font-semibold">
                Popular
              </span>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Best Sellers</h2>
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="font-body text-sm text-[var(--color-primary)] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
            >
              View All
            </Link>
          </div>
          <ProductGrid
            products={bestSellingList.slice(0, 8)}
            isLoading={bestSellingLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section-gap bg-[var(--color-bg-muted)]">
        <div className="container-normal">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-primary)] font-semibold">
                Just Landed
              </span>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">New Arrivals</h2>
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="font-body text-sm text-[var(--color-primary)] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
            >
              View All
            </Link>
          </div>
          <ProductGrid
            products={newArrivalsList}
            isLoading={newArrivalsLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
