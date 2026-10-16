import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useGetCategoryTreeQuery, useGetProductsQuery } from '../../../redux/api/storeApi';
import { ProductCard, ProductGridSkeleton } from '../../../components/product/ProductCard';
import { Button, EmptyState, ErrorState, Modal, cn } from '../../../components/ui';
import { categoryIcon } from '../../../components/layout/categoryIcons';
import { ROUTES } from '../../../utils/constants';
import { formatPrice } from '../../../utils/formatPrice';

const SORTS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
  { value: '-rating', label: 'Top rated' },
  { value: '-sold_count', label: 'Best selling' },
];
const PAGE_SIZE = 12;

export const ProductListing: React.FC<{ categorySlug?: string; title: string; subtitle?: string }> = ({ categorySlug, title, subtitle }) => {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const { data: tree = [] } = useGetCategoryTreeQuery();

  const page = Number(params.get('page') ?? 1) || 1;
  const filters = {
    search: params.get('search') ?? undefined,
    category_slug: categorySlug,
    sort_by: params.get('sort_by') ?? '-created_at',
    min_price: params.get('min_price') ?? undefined,
    max_price: params.get('max_price') ?? undefined,
    min_rating: params.get('min_rating') ?? undefined,
    on_sale: params.get('on_sale') === 'true' ? true : undefined,
    best_seller: params.get('best_seller') === 'true' ? true : undefined,
    new_arrival: params.get('new_arrival') === 'true' ? true : undefined,
    page,
    page_size: PAGE_SIZE,
  };
  const { data, isFetching, isError, refetch } = useGetProductsQuery(filters as never);

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  const activeCount = ['min_price', 'max_price', 'min_rating', 'on_sale'].filter((k) => params.get(k)).length;
  const roots = tree.filter((c) => c.slug !== 'brands');
  const current = roots.find((c) => c.slug === categorySlug || c.children?.some((ch) => ch.slug === categorySlug));
  const siblings = current?.children ?? [];

  const [minPrice, setMinPrice] = React.useState(params.get('min_price') ?? '');
  const [maxPrice, setMaxPrice] = React.useState(params.get('max_price') ?? '');
  React.useEffect(() => {
    setMinPrice(params.get('min_price') ?? '');
    setMaxPrice(params.get('max_price') ?? '');
  }, [params]);

  const priceInputs = (
    <div>
      <p className="mb-2 text-sm font-bold">Price (KES)</p>
      <div className="flex items-center gap-2">
        <input inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))} placeholder="Min" aria-label="Minimum price" className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        <span className="text-ink-400">–</span>
        <input inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ''))} placeholder="Max" aria-label="Maximum price" className="h-10 w-full rounded-lg border border-ink-200 px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100" />
      </div>
      <Button size="sm" variant="secondary" className="mt-2" onClick={() => update({ min_price: minPrice || undefined, max_price: maxPrice || undefined })}>Apply</Button>
    </div>
  );

  const filterPanel = (
    <div className="space-y-6">
      {roots.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold">Categories</p>
          <ul className="space-y-0.5">
            <li><Link to={ROUTES.PRODUCTS} className={cn('flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-ink-50', !categorySlug && 'bg-brand-50 text-brand-800')}>All products</Link></li>
            {roots.map((c) => (
              <li key={c.id}>
                <Link to={ROUTES.CATEGORY(c.slug)} className={cn('flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-ink-50', current?.id === c.id && 'bg-brand-50 text-brand-800')}>
                  {categoryIcon(c.slug, 'h-4 w-4 text-brand-600')} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {priceInputs}
      <div>
        <p className="mb-2 text-sm font-bold">Customer rating</p>
        <div className="flex flex-wrap gap-2">
          {[4, 3].map((r) => (
            <button key={r} onClick={() => update({ min_rating: params.get('min_rating') === String(r) ? undefined : String(r) })} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold', params.get('min_rating') === String(r) ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 hover:border-brand-600')}>{r}★ & up</button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-xl bg-ink-50 px-3.5 py-3">
        <span className="text-sm font-semibold">On sale only</span>
        <input type="checkbox" checked={params.get('on_sale') === 'true'} onChange={(e) => update({ on_sale: e.target.checked ? 'true' : undefined })} className="h-4.5 w-4.5 accent-[#0b5d46]" />
      </label>
      {(activeCount > 0 || params.get('search')) && (
        <button onClick={() => setParams({}, { replace: true })} className="text-sm font-semibold text-red-600 hover:underline">Clear all filters</button>
      )}
    </div>
  );

  const pagination = data?.pagination;
  const search = params.get('search');

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium text-ink-500" aria-label="Breadcrumb">
        <Link to={ROUTES.HOME} className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
        <Link to={ROUTES.PRODUCTS} className={cn(!categorySlug && 'text-ink-900')}>Products</Link>
        {categorySlug && <><ChevronRight className="h-3 w-3" /><span className="text-ink-900">{title}</span></>}
      </nav>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{search ? `Results for “${search}”` : title}</h1>
        {subtitle && !search && <p className="max-w-2xl text-sm text-ink-500">{subtitle}</p>}
      </div>

      {siblings.length > 0 && (
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          {siblings.map((c) => (
            <Link key={c.id} to={ROUTES.CATEGORY(c.slug)} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition', categorySlug === c.slug ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 bg-white hover:border-brand-600 hover:text-brand-700')}>{c.name}</Link>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-32 rounded-2xl border border-ink-100 bg-white p-5">{filterPanel}</div></aside>

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-500" aria-live="polite">
              {isFetching && !data ? 'Loading…' : <><b className="text-ink-900">{pagination?.total_count ?? 0}</b> products</>}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" leftIcon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setFiltersOpen(true)}>
                Filters{activeCount > 0 && ` (${activeCount})`}
              </Button>
              <select value={filters.sort_by} onChange={(e) => update({ sort_by: e.target.value })} aria-label="Sort products" className="h-9 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {(params.get('min_price') || params.get('max_price') || params.get('min_rating') || params.get('on_sale')) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {params.get('min_price') && <Chip label={`From ${formatPrice(params.get('min_price'))}`} onRemove={() => update({ min_price: undefined })} />}
              {params.get('max_price') && <Chip label={`Up to ${formatPrice(params.get('max_price'))}`} onRemove={() => update({ max_price: undefined })} />}
              {params.get('min_rating') && <Chip label={`${params.get('min_rating')}★ & up`} onRemove={() => update({ min_rating: undefined })} />}
              {params.get('on_sale') && <Chip label="On sale" onRemove={() => update({ on_sale: undefined })} />}
            </div>
          )}

          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isFetching && !data ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"><ProductGridSkeleton count={PAGE_SIZE} /></div>
          ) : data && data.products.length === 0 ? (
            <EmptyState icon={<SearchX className="h-9 w-9" />} title="No products found" description="Try adjusting your search or clearing some filters." action={<Button onClick={() => setParams({}, { replace: true })}>Clear filters</Button>} />
          ) : (
            <div className={cn('grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-60')}>
              {data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={!pagination.has_previous} onClick={() => update({ page: String(page - 1) })} leftIcon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
              {pageWindow(pagination.current_page, pagination.total_pages).map((p, i) =>
                p === '…' ? <span key={`e${i}`} className="px-1 text-ink-400">…</span> : (
                  <button key={p} onClick={() => update({ page: String(p) })} aria-current={p === pagination.current_page ? 'page' : undefined} className={cn('h-9 min-w-9 rounded-xl px-3 text-sm font-semibold', p === pagination.current_page ? 'bg-brand-700 text-white' : 'hover:bg-ink-100')}>{p}</button>
                ),
              )}
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => update({ page: String(page + 1) })} rightIcon={<ChevronRight className="h-4 w-4" />}>Next</Button>
            </nav>
          )}
        </section>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">{filterPanel}<Button block className="mt-6" onClick={() => setFiltersOpen(false)}>Show results</Button></Modal>
    </div>
  );
};

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-800">
    {label}
    <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-brand-100" aria-label={`Remove ${label}`}><X className="h-3.5 w-3.5" /></button>
  </span>
);

const pageWindow = (current: number, total: number): Array<number | '…'> => {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
};
