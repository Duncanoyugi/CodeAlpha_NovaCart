import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../../cart';
import { WishlistItem } from '../components/WishlistItem';
import { WishlistEmpty } from '../components/WishlistEmpty';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';

export const WishlistPage: React.FC = () => {
  const { items, isLoading, getWishlist, removeItem } = useWishlist();
  const { addItemToCart } = useCart();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => { if (isAuthenticated) getWishlist(); }, [getWishlist, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="h-8 w-56 skeleton rounded mb-10" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-[var(--radius-lg)]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] items-start mb-10">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Wishlist</span>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">Your Favorites</h1>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-3 max-w-lg">Items you've saved for later.</p>
        </div>
        <div className="bg-[var(--color-bg-muted)] rounded-[var(--radius-xl)] p-6">
          <p className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Saved Items</p>
          <p className="font-display text-4xl font-bold text-[var(--color-text-primary)] mt-2">{items.length}</p>
          <Link to={ROUTES.PRODUCTS} className="block mt-6"><Button variant="primary" className="w-full">Continue Shopping</Button></Link>
        </div>
      </div>

      {items.length === 0 ? (
        <WishlistEmpty />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <WishlistItem key={item.id} item={item} onRemove={() => removeItem(item.id)} onAddToCart={() => addItemToCart({ product_id: item.product.id, quantity: 1 })} />
          ))}
        </div>
      )}
    </div>
  );
};