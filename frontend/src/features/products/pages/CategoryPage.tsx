import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { useGetProductsQuery } from '../api/productApi';
import { ROUTES } from '../../../utils/constants';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWishlist } from '../../wishlist';
import { useCart } from '../../cart';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetProductsQuery({ category_slug: slug || '', page: 1, page_size: 24 }, { skip: !slug });
  const { isAuthenticated } = useAuth();
  const { getWishlist, isInWishlist, addItem, removeItem } = useWishlist();
  const { addItemToCart } = useCart();

  useEffect(() => { if (isAuthenticated) getWishlist(); }, [getWishlist, isAuthenticated]);

  const products = data?.data || [];

  const handleAddToCart = (productId: string) => addItemToCart({ product_id: productId, quantity: 1 });
  const handleToggleWishlist = (productId: string) => isInWishlist(productId) ? removeItem(productId) : addItem(productId);

  if (isError) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-4">Category Not Found</h1>
        <Link to={ROUTES.PRODUCTS} className="btn-primary">View All Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Collection</span>
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">{slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All Products'}</h1>
        </div>
        <Link to={ROUTES.PRODUCTS} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline">View All Products</Link>
      </div>
      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} onAddToWishlist={handleToggleWishlist} wishlistIds={[]} />
    </div>
  );
};
