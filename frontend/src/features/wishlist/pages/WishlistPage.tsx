import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../../cart';
import { WishlistItem } from '../components/WishlistItem';
import { WishlistEmpty } from '../components/WishlistEmpty';
import { ROUTES } from '../../../utils/constants';

export const WishlistPage: React.FC = () => {
  const { items, isLoading, error, getWishlist, removeItem } = useWishlist();
  const { addItemToCart } = useCart();

  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-56" />
            {[...Array(3)].map((index) => (
              <div key={index} className="h-40 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] items-center mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-600">Wishlist</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">Favorites you can't forget</h1>
            <p className="mt-3 text-gray-500">Keep your top picks in one place and move them to checkout when you're ready.</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Saved items</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{items.length}</p>
            <Link to={ROUTES.PRODUCTS} className="btn-primary mt-6 inline-flex w-full justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <WishlistEmpty />
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onAddToCart={() => addItemToCart({ product_id: item.product.id, quantity: 1 })}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </MainLayout>
  );
};