import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProductDetails } from '../hooks/useProductDetails';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWishlist } from '../../wishlist';
import { useCart } from '../../cart';
import {
  useGetProductReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
} from '../../reviews/api/reviewApi';
import { ReviewForm } from '../../reviews/components/ReviewForm';
import { ReviewList } from '../../reviews/components/ReviewList';
import { ReviewStats } from '../../reviews/components/ReviewStats';
import { ROUTES } from '../../../utils/constants';
import { formatPrice, calculateDiscountPercentage } from '../../../utils';
import { Button } from '../../../components/common/Button';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { product, isLoading, error, getProduct, clearProduct } = useProductDetails();
  const { isAuthenticated } = useAuth();
  const { getWishlist, addItem, removeItem, isInWishlist } = useWishlist();
  const { addItemToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const { data: reviewsData } = useGetProductReviewsQuery(
    { productId: product?.id || '', page: 1 },
    { skip: !product?.id }
  );
  const { data: reviewStats } = useGetReviewStatsQuery(product?.id || '', {
    skip: !product?.id,
  });

  useEffect(() => {
    if (slug) getProduct(slug);
    return () => clearProduct();
  }, [slug, getProduct, clearProduct]);

  useEffect(() => {
    if (product?.images?.length) setSelectedImage(product.images[0]);
  }, [product]);

  useEffect(() => {
    if (isAuthenticated) getWishlist();
  }, [getWishlist, isAuthenticated]);

  const handleAddToCart = () => {
    if (product) addItemToCart({ product_id: product.id, quantity });
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    isInWishlist(product.id) ? removeItem(product.id) : addItem(product.id);
  };

  const handleReviewSubmit = async (data: { rating: number; title: string; comment: string }) => {
    if (!product) return;
    await createReview({ product: product.id, rating: data.rating, title: data.title, comment: data.comment });
  };

  const discountPercentage = useMemo(() => {
    if (!product) return 0;
    return calculateDiscountPercentage(product.price, product.final_price);
  }, [product]);

  const images = product?.images?.length ? product.images : product?.image_url ? [product.image_url] : [];

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--color-bg-muted)] rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/5] skeleton rounded-[var(--radius-lg)]" />
            <div className="space-y-4">
              <div className="h-8 skeleton w-3/4 rounded" />
              <div className="h-6 skeleton w-1/3 rounded" />
              <div className="h-10 skeleton w-1/4 rounded" />
              <div className="h-32 skeleton w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-4">Product Not Found</h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-6">We couldn't find the product you're looking for.</p>
        <Link to={ROUTES.PRODUCTS} className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 font-ui text-xs text-[var(--color-text-tertiary)]">
          <li><Link to={ROUTES.HOME} className="hover:text-[var(--color-text-accent)]">Home</Link></li>
          <li>/</li>
          <li><Link to={ROUTES.PRODUCTS} className="hover:text-[var(--color-text-accent)]">Products</Link></li>
          <li>/</li>
          <li className="text-[var(--color-gold-600)]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-muted)]">
            <img src={selectedImage || product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image) => (
                <button key={image} type="button" onClick={() => setSelectedImage(image)} className={`aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden border-2 transition ${selectedImage === image ? 'border-[var(--color-gold-400)]' : 'border-transparent'}`}>
                  <img src={image} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div>
            <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">{product.category.name}</span>
            <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2 leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[var(--color-gold-400)]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="font-ui text-sm font-medium text-[var(--color-text-primary)]">{Number(product.rating).toFixed(1)}</span>
            </div>
            <span className="font-ui text-xs text-[var(--color-text-tertiary)]">({product.num_reviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-ui text-2xl font-medium text-[var(--color-gold-600)]">{formatPrice(product.final_price)}</span>
            {discountPercentage > 0 && (
              <>
                <span className="font-ui text-base text-[var(--color-text-tertiary)] line-through">{formatPrice(product.price)}</span>
                <span className="font-ui text-xs font-bold text-[var(--color-gold-600)] bg-[var(--color-gold-50)] px-2 py-0.5 rounded-full border border-[var(--color-gold-100)]">-{discountPercentage}%</span>
              </>
            )}
          </div>

          <p className="font-ui text-sm text-[var(--color-text-secondary)] leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-ui text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-3">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button key={variant.id} className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] font-ui text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold-400)] hover:text-[var(--color-gold-600)] transition-colors">
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-ui text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-3">Quantity</h3>
            <div className="inline-flex items-center border border-[var(--color-border-strong)] rounded-[var(--radius-md)]">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors">−</button>
              <span className="w-12 text-center font-ui text-sm font-medium text-[var(--color-text-primary)]">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleAddToCart} disabled={product.stock_quantity === 0} className="w-full h-12 text-sm">
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            {isAuthenticated && (
              <Button variant="outline" onClick={handleToggleWishlist} className="w-full h-12 text-sm">
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            )}
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border-light)]">
            <div>
              <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">SKU</span>
              <p className="font-ui text-sm text-[var(--color-text-primary)] mt-1">{product.sku}</p>
            </div>
            <div>
              <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Availability</span>
              <p className={`font-ui text-sm mt-1 ${product.stock_quantity > 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {reviewStats && <ReviewStats stats={reviewStats} />}
          <div className="mt-8">
            <ReviewList reviews={reviewsData?.reviews || []} />
          </div>
        </div>
        <div>
          {isAuthenticated && (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6">
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-4">Write a Review</h3>
              <ReviewForm onSubmit={handleReviewSubmit} isLoading={isSubmittingReview} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};