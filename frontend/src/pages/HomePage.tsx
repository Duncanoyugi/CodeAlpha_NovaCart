import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { useGetFeaturedProductsQuery, useGetBestSellingProductsQuery, useGetNewArrivalsQuery } from '../features/products/api/productApi';
import { ROUTES } from '../utils/constants';
import { formatPrice } from '../utils';
import heroImg from '../assets/hero.png';

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

  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // set a target 8 hours from now (example)
    const target = new Date();
    target.setHours(target.getHours() + 8);

    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Hero Section - visually matched to prototype */}
      <section className="relative pt-6">
        <div className="container-custom">
          <div className="rounded-2xl overflow-hidden relative">
            <img src={heroImg} alt="hero" className="w-full h-[420px] object-cover block rounded-2xl" />
            <div className="absolute inset-0 bg-black/35 rounded-2xl" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-3xl px-8 py-10">
                <span className="inline-flex items-center gap-3 rounded-md bg-[#ff902b] px-3 py-2 text-sm font-semibold text-white">MEGA SALE</span>
                <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold text-white leading-tight">
                  Up to <span className="text-[#ff902b]">70% OFF</span>
                  <div className="text-4xl sm:text-5xl">on top brands</div>
                </h1>
                <p className="mt-4 text-lg text-white/90">Daily flash deals, fresh arrivals and free delivery on orders over $50.</p>
                <div className="mt-8">
                  <Link to={ROUTES.PRODUCTS} className="inline-flex items-center gap-3 rounded-full bg-[#ff902b] px-6 py-3 text-white font-semibold shadow-lg">
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Top Categories */}
      <section className="container-custom py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">TOP CATEGORIES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Phones & Tablets', icon: '📱', color: 'bg-blue-50' },
              { name: 'Electronics', icon: '🖥️', color: 'bg-purple-50' },
              { name: 'Fashion', icon: '👕', color: 'bg-pink-50' },
              { name: 'Home & Office', icon: '🏠', color: 'bg-orange-50' },
              { name: 'Health & Beauty', icon: '💅', color: 'bg-red-50' },
              { name: 'Groceries', icon: '🛒', color: 'bg-green-50' },
            ].map((cat) => (
              <div key={cat.name} className={`flex flex-col items-center gap-3 p-6 ${cat.color} rounded-2xl transition hover:shadow-md cursor-pointer`}>
                <div className="h-16 w-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-2xl shadow-sm">{ cat.icon}</div>
                <div className="text-sm font-medium text-gray-700 text-center">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      <section className="container-custom py-8">
        <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-[#2b2350] text-white px-8 py-5 flex items-center justify-between">
            <div className="text-2xl font-bold">FLASH SALES</div>
            <div className="text-sm font-semibold">Ends in <span className="inline-flex items-center gap-2 ml-3">
              <span className="bg-[#ff902b] text-white px-4 py-2 rounded-lg font-bold min-w-[56px] text-center">{String(Math.max(0, Math.floor((countdown.hours || 0)))).padStart(2, '0')}</span>
              <span className="text-white">:</span>
              <span className="bg-[#ff902b] text-white px-4 py-2 rounded-lg font-bold min-w-[56px] text-center">{String(Math.max(0, Math.floor((countdown.minutes || 0)))).padStart(2, '0')}</span>
              <span className="text-white">:</span>
              <span className="bg-[#ff902b] text-white px-4 py-2 rounded-lg font-bold min-w-[56px] text-center">{String(Math.max(0, Math.floor((countdown.seconds || 0)))).padStart(2, '0')}</span>
            </span></div>
          </div>
          <div className="bg-white p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProductGrid products={bestSellingList.slice(0, 8)} isLoading={bestSellingLoading} />
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