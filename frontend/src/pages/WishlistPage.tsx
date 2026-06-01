import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { WishlistItem } from '../components/wishlist/WishlistItem';
import { useWishlist } from '../features/wishlist/hooks/useWishlist';
import { useCart } from '../features/cart';
import { ROUTES } from '../utils/constants';

export const WishlistPage: React.FC = () => {
  const { items, totalItems, isLoading, getWishlist, removeItem } = useWishlist();
  const { addItemToCart, isAddingToCart } = useCart();

  useEffect(() => {
    getWishlist();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold">My Wishlist ({totalItems})</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save your favorite items here</p>
            <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl">
            {items.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onAddToCart={(productId: string) => addItemToCart({ product_id: productId, quantity: 1 })}
                isAddingToCart={isAddingToCart}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};