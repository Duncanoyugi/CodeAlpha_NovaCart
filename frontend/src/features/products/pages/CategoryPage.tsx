import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { useGetProductsQuery } from '../api/productApi';
import { ROUTES } from '../../../utils/constants';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWishlist } from '../../wishlist';
import { useCart } from '../../cart';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetProductsQuery(
    { category_slug: slug || '', page: 1, page_size: 24 },
    { skip: !slug }
  );
  const { isAuthenticated } = useAuth();
  const { items: wishlistItems, getWishlist, addItem, removeItem, isInWishlist } = useWishlist();
  const { addItemToCart } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      getWishlist();
    }
  }, [getWishlist, isAuthenticated]);

  const handleAddToCart = (productId: string) => {
    addItemToCart({ product_id: productId, quantity: 1 });
  };

  const handleToggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeItem(productId);
    } else {
      addItem(productId);
    }
  };

  const products = data?.data || [];

  if (isError) {
    return (
      <MainLayout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link to={ROUTES.PRODUCTS} className="btn-primary">
            View All Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category: {slug}</h1>
            <p className="text-gray-500 mt-2">Browse products in this collection.</p>
          </div>
          <Link to={ROUTES.PRODUCTS} className="btn-secondary">
            View All Products
          </Link>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleToggleWishlist}
          wishlistIds={wishlistItems.map((item) => item.product.id)}
        />
      </div>
    </MainLayout>
  );
};