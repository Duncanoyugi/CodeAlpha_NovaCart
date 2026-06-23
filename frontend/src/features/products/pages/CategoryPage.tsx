import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { useGetProductsQuery } from '../api/productApi';
import { ROUTES } from '../../../utils/constants';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWishlist } from '../../wishlist';
import { useCart } from '../../cart';
import { ArrowRight } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetProductsQuery({ category_slug: slug || '', page: 1, page_size: 24 }, { skip: !slug });
  const { isAuthenticated } = useAuth();
  const { getWishlist, isInWishlist, addItem, removeItem } = useWishlist();
  const { addItemToCart } = useCart();

  useEffect(() => { if (isAuthenticated) getWishlist(); }, [getWishlist, isAuthenticated]);

  const products = data?.data?.products || [];

  const handleAddToCart = (productId: string) => addItemToCart({ product_id: productId, quantity: 1 });
  const handleToggleWishlist = (productId: string) => isInWishlist(productId) ? removeItem(productId) : addItem(productId);

  if (isError) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-4xl text-[var(--color-text-primary)] mb-4">Category Not Found</h1>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-8">The category you're looking for doesn't exist or has been removed.</p>
          <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex items-center gap-2">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All Products';

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)] font-semibold">Collection</span>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">{categoryName}</h1>
        </div>
        <Link to={ROUTES.PRODUCTS} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline font-medium flex items-center gap-1.5">
          View All Products
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} onAddToWishlist={handleToggleWishlist} wishlistIds={[]} />
    </div>
  );
};
