import React from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { useGetFeaturedProductsQuery, useGetBestSellingProductsQuery, useGetNewArrivalsQuery } from '../features/products/api/productApi';
import { ROUTES } from '../utils/constants';
import { formatPrice } from '../utils';

export const HomePage: React.FC = () => {
  const { data: featuredProducts = [], isLoading: featuredLoading } = useGetFeaturedProductsQuery();
  const { data: bestSellingProducts = [], isLoading: bestSellingLoading } = useGetBestSellingProductsQuery();
  const { data: newArrivals = [], isLoading: newArrivalsLoading } = useGetNewArrivalsQuery();

  const normalizeProducts = (products: unknown): any[] => {
    if (Array.isArray(products)) return products;
    if (products && typeof products === 'object' && 'data' in products && Array.isArray((products as any).data)) {
      return (products as any).data;
    }
    return [];
  };

  const featuredList = normalizeProducts(featuredProducts);
  const bestSellingList = normalizeProducts(bestSellingProducts);
  const newArrivalsList = normalizeProducts(newArrivals);

  const previewGroups = [featuredList, bestSellingList, newArrivalsList];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-700 to-slate-950 text-white pt-20 pb-24">
        <div className="container-custom grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.32em] text-white/80">
              Curated for modern shoppers
            </span>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                Shop premium finds with fast checkout and effortless delivery.
              </h1>
              <p className="text-lg leading-8 text-slate-200">
                NovaCart brings you curated categories, exclusive deals, and seamless shopping from browse to buy. Discover trending products handpicked for style, quality, and value.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to={ROUTES.PRODUCTS}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-primary-700 shadow-lg shadow-white/10 transition hover:bg-slate-100"
              >
                Start shopping
              </Link>
              <Link
                to={ROUTES.WISHLIST}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                View wishlist
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-3xl bg-white/10 p-4 text-center">
                <p className="text-2xl font-semibold">4.9/5</p>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/60">Customer rating</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-center">
                <p className="text-2xl font-semibold">Free</p>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/60">Delivery on orders</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-center">
                <p className="text-2xl font-semibold">24h</p>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/60">Support response</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-center">
                <p className="text-2xl font-semibold">100+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/60">Trusted brands</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {previewGroups.map((group, index) => (
                <div key={index} className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                    {index === 0 ? 'Featured' : index === 1 ? 'Best sellers' : 'New arrivals'}
                  </div>
                  <div className="space-y-3">
                    {group.slice(0, 2).map((product) => (
                      <div key={product.id} className="rounded-3xl bg-slate-950/70 p-4 transition hover:bg-slate-900/90">
                        <p className="text-sm font-semibold text-white line-clamp-2">{product.name}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                          <span>{product.rating?.toFixed(1)} ★</span>
                          <span>{formatPrice(product.final_price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 text-white/90">
              <h3 className="text-lg font-semibold">Shop with confidence</h3>
              <p className="mt-3 text-sm text-slate-200 leading-6">
                Enjoy curated product drops, easy returns, and a shopping experience built for speed. NovaCart is designed to help you find what you need without the clutter.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-primary-600">Why NovaCart</p>
                <h2 className="mt-3 text-3xl font-semibold text-gray-900">A smarter storefront for every shopper.</h2>
              </div>
              <Link to={ROUTES.PRODUCTS} className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700">
                Browse all products
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Fast, intuitive search', description: 'Find products instantly with smart filters and curated recommendations.' },
                { title: 'Exclusive offers', description: 'Never miss a deal with our latest collections and limited-time launches.' },
                { title: 'Secure checkout', description: 'Checkout confidently with safe payments and seamless order tracking.' },
                { title: 'Premium support', description: '24/7 customer care and rapid help whenever you need it.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-gray-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-slate-950 p-8 text-white shadow-sm">
            <h3 className="text-2xl font-semibold">Top picks this week</h3>
            <p className="mt-3 text-sm text-slate-300">Curated from our top categories, optimized for quality and value.</p>
            <div className="mt-8 space-y-4">
              {featuredList.slice(0, 3).map((product) => (
                <div key={product.id} className="rounded-3xl bg-white/5 p-4 transition hover:bg-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white line-clamp-1">{product.name}</p>
                    <p className="text-sm text-slate-300">{formatPrice(product.final_price)}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    <span>{product.rating?.toFixed(1)} ★</span>
                    <span>•</span>
                    <span>{product.category?.name ?? 'Top category'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-primary-600">Collections</p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">Popular product collections</h2>
          </div>
          <Link to={ROUTES.PRODUCTS} className="text-primary-600 font-semibold hover:text-primary-700">
            Browse all collections →
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {['Home Essentials', 'Daily Tech', 'Wellness Picks'].map((label) => (
            <div key={label} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{label}</p>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{label}</h3>
              <p className="mt-3 text-sm text-gray-600">Fresh arrivals, top-rated items, and curated deals so you can shop with confidence.</p>
              <Link to={ROUTES.PRODUCTS} className="mt-6 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                Explore {label.toLowerCase()} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to={ROUTES.PRODUCTS} className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        <ProductGrid products={featuredList} isLoading={featuredLoading} />
      </section>

      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Best Selling</h2>
            <Link to={ROUTES.PRODUCTS} className="text-primary-600 hover:text-primary-700">
              View All →
            </Link>
          </div>
          <ProductGrid products={bestSellingList} isLoading={bestSellingLoading} />
        </div>
      </section>

      <section className="container-custom py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link to={ROUTES.PRODUCTS} className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        <ProductGrid products={newArrivalsList} isLoading={newArrivalsLoading} />
      </section>
    </>
  );
};