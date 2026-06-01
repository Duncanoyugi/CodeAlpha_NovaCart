import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
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

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { product, isLoading, error, getProduct, clearProduct } = useProductDetails();
  const { isAuthenticated } = useAuth();
  const { getWishlist, addItem, removeItem, isInWishlist } = useWishlist();
  const { addItemToCart } = useCart();
  const [reviewPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const { data: reviewsData } = useGetProductReviewsQuery(
    { productId: product?.id || '', page: reviewPage },
    { skip: !product?.id }
  );
  const { data: reviewStats } = useGetReviewStatsQuery(product?.id || '', {
    skip: !product?.id,
  });

  useEffect(() => {
    if (slug) {
      getProduct(slug);
    }

    return () => {
      clearProduct();
    };
  }, [slug, getProduct, clearProduct]);

  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    if (isAuthenticated) {
      getWishlist();
    }
  }, [getWishlist, isAuthenticated]);

  const handleAddToCart = () => {
    if (product) {
      addItemToCart({ product_id: product.id, quantity: 1 });
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product.id);
    }
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    if (!product) return;
    await createReview({ product: product.id, rating: data.rating, title: data.title, comment: data.comment });
  };

  const reviewItems = reviewsData?.reviews || [];
  const isProductInWishlist = product ? isInWishlist(product.id) : false;

  const discountPercentage = useMemo(() => {
    if (!product) return 0;
    return calculateDiscountPercentage(product.price, product.final_price);
  }, [product]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-6">We couldn't find the product you're looking for.</p>
          <Link to={ROUTES.PRODUCTS} className="btn-primary">
            Back to Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="mb-6">
          <Link to={ROUTES.PRODUCTS} className="text-sm text-primary-600 hover:text-primary-700">
            ← Back to products
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="grid gap-4 lg:grid-cols-[1fr_80px]">
                <div className="space-y-4 p-6">
                  <div className="overflow-hidden rounded-[32px] bg-gray-100">
                    <img
                      src={selectedImage || product.image_url}
                      alt={product.name}
                      className="h-full w-full min-h-[420px] object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[product.image_url, ...product.images.filter((image) => image !== product.image_url)].slice(0, 3).map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`overflow-hidden rounded-3xl border p-1 transition ${selectedImage === image || (!selectedImage && image === product.image_url)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={product.name}
                          className="h-24 w-full object-cover rounded-3xl"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:block space-y-4 p-6">
                  <div className="rounded-3xl border border-gray-200 bg-primary-50 p-5 text-sm font-semibold text-primary-700">
                    Fast shipping • Secure checkout • Easy returns
                  </div>
                  <div className="rounded-3xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-semibold text-gray-900">Product Guarantees</p>
                    <ul className="mt-4 space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-600" />
                        Quality checked and ready to ship.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-600" />
                        Trusted by customers in {product.category.name}.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-600" />
                        {product.is_available ? 'Available now' : 'Currently unavailable'}.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <Link
                      to={ROUTES.CATEGORY(product.category.slug)}
                      className="hover:text-primary-600"
                    >
                      {product.category.name}
                    </Link>
                    <span>•</span>
                    <span>{product.stock_quantity > 0 ? 'In stock' : 'Out of stock'}</span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{product.rating.toFixed(1)} ★</span>
                    <span>{product.num_reviews} reviews</span>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div>
                      <p className="text-3xl font-bold text-primary-600">{formatPrice(product.final_price)}</p>
                      {discountPercentage > 0 && (
                        <p className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</p>
                      )}
                    </div>
                    {discountPercentage > 0 && (
                      <span className="rounded-full bg-primary-100 text-primary-700 px-3 py-1 text-sm">
                        Save {discountPercentage}%
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 leading-relaxed">{product.short_description}</p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                      className="btn-primary w-full sm:w-auto"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleToggleWishlist}
                      className={`w-full sm:w-auto rounded-2xl border px-5 py-3 text-sm font-medium transition ${
                        isProductInWishlist
                          ? 'border-red-500 bg-red-50 text-red-700 hover:border-red-600'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {isProductInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                  <p className="mt-3 text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">SKU</p>
                    <p className="mt-2 font-semibold text-gray-900">{product.sku}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Stock</p>
                    <p className="mt-2 font-semibold text-gray-900">{product.stock_quantity > 0 ? 'In stock' : 'Out of stock'}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Category</p>
                    <Link to={ROUTES.CATEGORY(product.category.slug)} className="mt-2 inline-block font-semibold text-primary-600 hover:text-primary-700">
                      {product.category.name}
                    </Link>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Sold</p>
                    <p className="mt-2 font-semibold text-gray-900">{product.sold_count}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-white rounded-3xl shadow-sm p-6">
                {reviewStats && <ReviewStats stats={reviewStats} />}
                <ReviewList reviews={reviewItems} />
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Write a Review</h2>
                <ReviewForm onSubmit={handleReviewSubmit} isLoading={isSubmittingReview} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};