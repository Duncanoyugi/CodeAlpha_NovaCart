import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '../../types';
import { useCart } from '../../features/cart/hooks/useCart';
import { useAppSelector } from '../../redux/hooks';
import { useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../redux/api/storeApi';
import { formatPrice } from '../../utils/formatPrice';
import { onImageErrorWithFallback, PLACEHOLDER_IMAGE, getImageSrcSet } from '../../utils/media';
import { ROUTES } from '../../utils/constants';
import { Badge, Stars, cn } from '../ui';

export const WishlistButton: React.FC<{ productId: string; className?: string }> = ({ productId, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [add, { isLoading: adding }] = useAddToWishlistMutation();
  const [remove, { isLoading: removing }] = useRemoveFromWishlistMutation();
  const saved = !!data?.items.some((i) => i.product === productId);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Log in to save items to your wishlist');
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    try {
      if (saved) {
        await remove(productId).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await add(productId).unwrap();
        toast.success('Saved to wishlist');
      }
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not update your wishlist');
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={adding || removing}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-soft backdrop-blur transition hover:scale-110', className)}
    >
      <Heart className={cn('h-4.5 w-4.5 transition', saved ? 'fill-red-500 text-red-500' : 'text-ink-600')} />
    </button>
  );
};

export const ProductCard: React.FC<{ product: Product; priority?: boolean }> = ({ product }) => {
  const { addItemToCart, isAddingToCart } = useCart();
  const [busy, setBusy] = React.useState(false);
  const outOfStock = !product.is_available || product.stock_quantity <= 0;
  const hasDiscount = product.discount_percentage > 0 && product.final_price < product.price;
  const lowStock = !outOfStock && product.stock_quantity <= 5;

  // Build fallback chain: image_url -> images[] -> placeholder
  const srcSet = React.useMemo(() => getImageSrcSet(product), [product.image_url, product.images]);
  const [currentSrcIndex, setCurrentSrcIndex] = React.useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    onImageErrorWithFallback(e, currentSrcIndex, srcSet);
    setCurrentSrcIndex((i) => i + 1);
  };

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    await addItemToCart({ product_id: product.id, quantity: 1 });
    setBusy(false);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="relative block aspect-square overflow-hidden bg-ink-100" aria-label={product.name}>
        <img
          src={srcSet[0] || PLACEHOLDER_IMAGE}
          onError={handleImageError}
          alt={product.name}
          loading="lazy"
          className={cn('h-full w-full object-cover transition duration-500 group-hover:scale-105', outOfStock && 'opacity-60 grayscale')}
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {hasDiscount && <Badge tone="danger" className="shadow-sm">-{Math.round(product.discount_percentage)}%</Badge>}
          {product.is_new_arrival && !hasDiscount && <Badge tone="brand">New</Badge>}
          {product.is_best_seller && <Badge tone="accent">Best seller</Badge>}
        </div>
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink-900/80 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-white">Out of stock</span>
        )}
      </Link>

      <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5" />

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {product.category_name && <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-600">{product.category_name}</p>}
        <Link to={ROUTES.PRODUCT_DETAIL(product.slug)} className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-ink-900 hover:text-brand-700">
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2">
          {product.num_reviews > 0 ? (
            <>
              <Stars value={product.rating} />
              <span className="text-xs text-ink-500">({product.num_reviews})</span>
            </>
          ) : (
            <span className="text-xs text-ink-400">No reviews yet</span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-ink-900">{formatPrice(product.final_price)}</span>
            {hasDiscount && <span className="text-sm text-ink-400 line-through">{formatPrice(product.price)}</span>}
          </div>
          {lowStock && <p className="mt-0.5 text-xs font-semibold text-amber-600">Only {product.stock_quantity} left</p>}

          <button
            onClick={add}
            disabled={outOfStock || busy || isAddingToCart}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-50 text-sm font-bold text-brand-800 transition hover:bg-brand-700 hover:text-white disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400"
          >
            {outOfStock ? <><Eye className="h-4 w-4" /> Unavailable</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
    <div className="skeleton aspect-square rounded-none" />
    <div className="space-y-3 p-4">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-6 w-1/2" />
      <div className="skeleton h-10 w-full" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <>{Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}</>
);
