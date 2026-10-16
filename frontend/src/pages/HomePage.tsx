import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, ShieldCheck, Smartphone, Sparkles, Truck, Zap } from 'lucide-react';
import { useGetBestSellersQuery, useGetCategoryTreeQuery, useGetFeaturedProductsQuery, useGetNewArrivalProductsQuery } from '../redux/api/storeApi';
import { ProductCard, ProductGridSkeleton } from '../components/product/ProductCard';
import { categoryIcon } from '../components/layout/categoryIcons';
import { Button, SectionHeading } from '../components/ui';
import { ROUTES } from '../utils/constants';
import { onImageError, PLACEHOLDER_IMAGE } from '../utils/media';
import { formatPrice } from '../utils/formatPrice';
import type { Product } from '../types';

const Rail: React.FC<{ eyebrow: string; title: string; products?: Product[]; loading: boolean; to: string }> = ({ eyebrow, title, products, loading, to }) => {
  if (!loading && (!products || products.length === 0)) return null;
  return (
    <section className="container-page py-10">
      <SectionHeading eyebrow={eyebrow} title={title} action={<Link to={to} className="hidden items-center gap-1 text-sm font-bold text-brand-700 hover:gap-2 sm:flex">View all <ArrowRight className="h-4 w-4" /></Link>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {loading ? <ProductGridSkeleton count={4} /> : products!.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const { data: tree = [] } = useGetCategoryTreeQuery();
  const featured = useGetFeaturedProductsQuery();
  const best = useGetBestSellersQuery();
  const fresh = useGetNewArrivalProductsQuery();
  const hero = (featured.data ?? best.data ?? fresh.data ?? []).filter((p) => p.image_url).slice(0, 3);
  const roots = tree.filter((c) => c.slug !== 'brands');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-accent-300 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" /> New gadgets just landed
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Power up your day with <span className="text-accent-300">gadgets</span> that last.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-brand-100/85 sm:text-lg">
              Fast chargers, crisp-sound earbuds, big-capacity power banks and smart watches — delivered anywhere in Kenya. Pay with M-Pesa in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ROUTES.PRODUCTS}><Button size="lg" variant="accent" rightIcon={<ArrowRight className="h-5 w-5" />}>Shop now</Button></Link>
              <Link to={`${ROUTES.PRODUCTS}?on_sale=true`}><Button size="lg" variant="ghost" className="text-white ring-1 ring-white/25 hover:bg-white/10">See deals</Button></Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[['2–4 days', 'Countrywide delivery'], ['M-Pesa', 'Instant checkout'], ['7 days', 'Easy returns']].map(([k, v]) => (
                <div key={k}><dt className="font-display text-xl font-extrabold text-white">{k}</dt><dd className="text-xs text-brand-200/80">{v}</dd></div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
            {(hero.length ? hero : [null, null, null]).map((p, i) => (
              <Link key={p?.id ?? i} to={p ? ROUTES.PRODUCT_DETAIL(p.slug) : ROUTES.PRODUCTS} className={`group relative overflow-hidden rounded-3xl bg-white/95 p-3 shadow-lift transition hover:-translate-y-1 ${i === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'}`}>
                <img src={p?.image_url || PLACEHOLDER_IMAGE} onError={onImageError} alt={p?.name ?? 'Featured product'} className="h-full w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105" />
                {p && (
                  <span className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl bg-white/95 px-3 py-2 text-ink-900 shadow-soft backdrop-blur">
                    <span className="line-clamp-1 text-xs font-bold">{p.name}</span>
                    <span className="ml-2 shrink-0 text-xs font-extrabold text-brand-700">{formatPrice(p.final_price)}</span>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {roots.length > 0 && (
        <section className="container-page py-12">
          <SectionHeading eyebrow="Browse" title="Shop by category" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {roots.slice(0, 6).map((c) => (
              <Link key={c.id} to={ROUTES.CATEGORY(c.slug)} className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">{categoryIcon(c.slug, 'h-6 w-6')}</span>
                <span className="text-sm font-bold leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Rail eyebrow="Editor’s picks" title="Featured products" products={featured.data} loading={featured.isLoading} to={`${ROUTES.PRODUCTS}?featured=true`} />

      {/* Promo band */}
      <section className="container-page py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-400 to-accent-500 p-8 sm:p-12">
          <div className="relative z-10 max-w-lg">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-ink-900/70"><BadgePercent className="h-4 w-4" /> Limited-time deals</p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink-900 sm:text-4xl">Up to 30% off selected accessories</h2>
            <p className="mt-2 text-ink-900/70">Grab the savings while stock lasts.</p>
            <Link to={`${ROUTES.PRODUCTS}?on_sale=true`} className="mt-6 inline-block"><Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>Shop deals</Button></Link>
          </div>
          <Zap className="absolute -right-6 -top-6 h-64 w-64 rotate-12 text-white/20" />
        </div>
      </section>

      <Rail eyebrow="Customer favourites" title="Best sellers" products={best.data} loading={best.isLoading} to={`${ROUTES.PRODUCTS}?best_seller=true`} />
      <Rail eyebrow="Just in" title="New arrivals" products={fresh.data} loading={fresh.isLoading} to={`${ROUTES.PRODUCTS}?new_arrival=true`} />

      {/* Trust */}
      <section className="container-page py-12">
        <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-3 sm:p-10">
          {[
            { icon: Smartphone, title: 'Pay the Kenyan way', text: 'Approve an M-Pesa prompt on your phone — no card needed.' },
            { icon: Truck, title: 'Delivered to your door', text: 'Same-day in Nairobi, 2–4 days across the country.' },
            { icon: ShieldCheck, title: 'Genuine & protected', text: 'Authentic products, secure checkout and easy returns.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="h-6 w-6" /></span>
              <div><h3 className="text-base font-bold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
