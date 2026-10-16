import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap, Check, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateReviewMutation, useGetProductBySlugQuery, useGetReviewsQuery, useGetReviewStatsQuery } from '../../../redux/api/storeApi';
import { useCart } from '../../cart/hooks/useCart';
import { useAppSelector } from '../../../redux/hooks';
import { ProductCard, WishlistButton } from '../../../components/product/ProductCard';
import { ProductImage } from '../../../components/common/ProductImage';
import { Badge, Button, EmptyState, ErrorState, Skeleton, Stars, Textarea, Input, cn } from '../../../components/ui';
import { formatPrice } from '../../../utils/formatPrice';
import { ROUTES } from '../../../utils/constants';
import { getErrorMessage } from '../../../services/errorHandler';

const Reviews: React.FC<{ productId: string }> = ({ productId }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data: stats } = useGetReviewStatsQuery(productId);
  const { data } = useGetReviewsQuery(productId);
  const [create, { isLoading }] = useCreateReviewMutation();
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({ product: productId, rating, title: title.trim(), comment: comment.trim() }).unwrap();
      toast.success('Thanks! Your review will appear once approved.');
      setShowForm(false);
      setTitle('');
      setComment('');
    } catch (err) {
      toast.error(getErrorMessage((err as { data?: unknown }).data ? { response: { data: (err as { data: unknown }).data } } : err, 'Could not submit your review'));
    }
  };

  return (
    <section className="mt-16" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-heading" className="text-2xl font-bold">Customer reviews</h2>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Write a review'}</Button>
        ) : (
          <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-brand-700 hover:underline">Log in to write a review</Link>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="font-display text-5xl font-extrabold">{stats?.average_rating?.toFixed(1) ?? '0.0'}</p>
          <Stars value={stats?.average_rating ?? 0} size={18} className="mt-2" />
          <p className="mt-1 text-sm text-ink-500">{stats?.total_reviews ?? 0} reviews</p>
          <div className="mt-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const d = stats?.rating_distribution?.[String(n)];
              return (
                <div key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-semibold">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-accent-400" style={{ width: `${d?.percentage ?? 0}%` }} /></div>
                  <span className="w-6 text-right text-ink-500">{d?.count ?? 0}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {showForm && (
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
              <div>
                <p className="mb-1.5 text-sm font-semibold">Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className="p-0.5"><Stars value={n <= rating ? 1 : 0} size={28} className="[&>span]:!w-7" /></button>
                  ))}
                </div>
              </div>
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="Sum it up in a few words" />
              <Textarea label="Your review" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={10} placeholder="What did you like or dislike?" />
              <Button type="submit" loading={isLoading}>Submit review</Button>
            </form>
          )}
          {data?.reviews?.length ? (
            data.reviews.map((r) => (
              <article key={r.id} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{r.user_name?.[0]?.toUpperCase()}</span>
                    <div>
                      <p className="text-sm font-bold">{r.user_name}</p>
                      <p className="text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</p>
                    </div>
                  </div>
                  {r.is_verified_purchase && <Badge tone="brand"><Check className="h-3 w-3" /> Verified purchase</Badge>}
                </div>
                <Stars value={r.rating} className="mt-3" />
                <h3 className="mt-2 font-sans text-base font-bold">{r.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{r.comment}</p>
                {r.admin_response && <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm"><b>NovaCart replied:</b> {r.admin_response}</p>}
              </article>
            ))
          ) : (
            !showForm && <p className="rounded-2xl bg-white p-8 text-center text-sm text-ink-500 shadow-soft">No reviews yet — be the first to share your experience.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export const ProductDetailsPage: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, error } = useGetProductBySlugQuery(slug);
  const { addItemToCart, isAddingToCart, getItemQuantity } = useCart();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [qty, setQty] = React.useState(1);
  const [variantId, setVariantId] = React.useState<string | undefined>();
  const [activeImage, setActiveImage] = React.useState(0);

  React.useEffect(() => {
    setQty(1);
    setActiveImage(0);
    setVariantId(undefined);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container-page grid gap-10 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-10 w-full" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-32 w-full" /><Skeleton className="h-12 w-full" /></div>
      </div>
    );
  }
  if (isError || !data) {
    if ((error as { status?: number } | undefined)?.status === 404) {
      return <EmptyState icon={<Compass className="h-9 w-9" />} title="Product not found" description="This product may have been removed or is no longer available." action={<Link to={ROUTES.PRODUCTS}><Button>Browse products</Button></Link>} />;
    }
    return <ErrorState onRetry={refetch} />;
  }

  const { product, related_products } = data;
  const variant = product.variants?.find((v) => v.id === variantId);
  const price = variant?.price ? variant.price : product.final_price;
  const stock = variant ? Math.min(variant.stock_quantity, product.stock_quantity) : product.stock_quantity;
  const outOfStock = !product.is_available || stock <= 0;
  const inCart = getItemQuantity(product.id);
  const maxAddable = Math.max(stock - inCart, 0);
  const hasDiscount = product.discount_percentage > 0 && product.final_price < product.price && !variant;
  const gallery = [product.image_url, ...(product.images ?? [])].filter(Boolean);

  const add = async () => {
    await addItemToCart({ product_id: product.id, variant_id: variantId, quantity: qty });
  };
  const buyNow = async () => {
    const ok = await addItemToCart({ product_id: product.id, variant_id: variantId, quantity: qty }, { openDrawer: false });
    if (ok) navigate(isAuthenticated ? ROUTES.CHECKOUT : ROUTES.LOGIN, { state: { from: { pathname: ROUTES.CHECKOUT } } });
  };

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-500" aria-label="Breadcrumb">
        <Link to={ROUTES.HOME} className="hover:text-brand-700">Home</Link><ChevronRight className="h-3 w-3" />
        <Link to={ROUTES.PRODUCTS} className="hover:text-brand-700">Products</Link>
        {product.category_slug && <><ChevronRight className="h-3 w-3" /><Link to={ROUTES.CATEGORY(product.category_slug)} className="hover:text-brand-700">{product.category_name}</Link></>}
        <ChevronRight className="h-3 w-3" /><span className="line-clamp-1 text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-soft">
            <ProductImage product={product} imageUrl={gallery[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            {hasDiscount && <Badge tone="danger" className="absolute left-4 top-4 px-3 py-1 text-sm">-{Math.round(product.discount_percentage)}%</Badge>}
            <WishlistButton productId={product.id} className="absolute right-4 top-4 !h-11 !w-11" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {gallery.map((src, i) => (
                <button key={src + i} onClick={() => setActiveImage(i)} aria-label={`Show image ${i + 1}`} className={cn('h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white', i === activeImage ? 'border-brand-700' : 'border-transparent opacity-70 hover:opacity-100')}>
                  <ProductImage product={product} imageUrl={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.category_name && <Badge tone="brand">{product.category_name}</Badge>}
            {product.is_best_seller && <Badge tone="accent">Best seller</Badge>}
            {product.is_new_arrival && <Badge tone="info">New</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={product.rating} size={18} />
            <span className="text-sm text-ink-500">{product.num_reviews > 0 ? `${product.rating.toFixed(1)} (${product.num_reviews} reviews)` : 'No reviews yet'}</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl font-extrabold">{formatPrice(price)}</span>
            {hasDiscount && <><span className="text-lg text-ink-400 line-through">{formatPrice(product.price)}</span><Badge tone="danger">Save {formatPrice(product.price - product.final_price)}</Badge></>}
          </div>
          <p className="mt-1 text-xs text-ink-500">VAT inclusive</p>

          {product.short_description && <p className="mt-5 leading-relaxed text-ink-600">{product.short_description}</p>}

          {product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold">Option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button key={v.id} onClick={() => setVariantId(v.id === variantId ? undefined : v.id)} disabled={v.stock_quantity <= 0} className={cn('rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-ink-300 disabled:line-through', v.id === variantId ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-ink-200 hover:border-brand-600')}>{v.name}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            {outOfStock ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Currently out of stock</p>
            ) : (
              <p className={cn('flex items-center gap-2 text-sm font-semibold', stock <= 5 ? 'text-amber-600' : 'text-brand-700')}>
                <span className={cn('h-2 w-2 rounded-full', stock <= 5 ? 'bg-amber-500' : 'bg-brand-600')} />
                {stock <= 5 ? `Only ${stock} left in stock — order soon` : 'In stock and ready to ship'}
              </p>
            )}
            {inCart > 0 && <p className="mt-1 text-xs text-ink-500">{inCart} already in your cart</p>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-xl border border-ink-200 bg-white">
              <button aria-label="Decrease quantity" className="h-full w-11 disabled:text-ink-300" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}><Minus className="mx-auto h-4 w-4" /></button>
              <span className="w-10 text-center font-bold tabular-nums">{qty}</span>
              <button aria-label="Increase quantity" className="h-full w-11 disabled:text-ink-300" disabled={qty >= maxAddable} onClick={() => setQty((q) => q + 1)}><Plus className="mx-auto h-4 w-4" /></button>
            </div>
            <Button size="lg" className="flex-1" disabled={outOfStock || maxAddable === 0} loading={isAddingToCart} onClick={add} leftIcon={<ShoppingBag className="h-5 w-5" />}>Add to cart</Button>
          </div>
          <Button size="lg" variant="accent" block className="mt-3" disabled={outOfStock || maxAddable === 0} onClick={buyNow} leftIcon={<Zap className="h-5 w-5" />}>Buy now</Button>

          <ul className="mt-8 grid gap-3 rounded-2xl bg-white p-5 text-sm shadow-soft sm:grid-cols-3">
            {[
              { icon: Truck, t: 'Fast delivery', d: 'Nairobi same day' },
              { icon: ShieldCheck, t: 'Secure payment', d: 'M-Pesa & card' },
              { icon: RotateCcw, t: '7-day returns', d: 'On unused items' },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex items-center gap-3"><Icon className="h-5 w-5 shrink-0 text-brand-700" /><div><p className="font-bold">{t}</p><p className="text-xs text-ink-500">{d}</p></div></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Description */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold">About this product</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-600">{product.description}</p>
        </div>
        <dl className="h-fit rounded-2xl bg-white p-6 text-sm shadow-soft">
          <h3 className="mb-3 font-sans text-base font-bold">Details</h3>
          {[['SKU', product.sku], ['Category', product.category_name], ['Weight', product.weight ? `${product.weight} kg` : null]].filter(([, v]) => v).map(([k, v]) => (
            <div key={k as string} className="flex justify-between border-t border-ink-100 py-2.5"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
          {product.tags?.length > 0 && <div className="flex flex-wrap gap-1.5 border-t border-ink-100 pt-3">{product.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>}
        </dl>
      </section>

      <Reviews productId={product.id} />

      {related_products?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{related_products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;
