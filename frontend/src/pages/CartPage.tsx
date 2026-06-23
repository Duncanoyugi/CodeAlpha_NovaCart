import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { CartEmpty } from '../components/cart/CartEmpty';
import { useCart } from '../features/cart';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { formatPrice } from '../utils';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    isLoading,
    isUpdatingCart,
    getCart,
    updateItemQuantity,
    removeItemFromCart,
  } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    getCart();
  }, [getCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CART } });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="container-custom page-padding">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-40 skeleton rounded mb-10" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 skeleton rounded-[var(--radius-lg)]" />
              ))}
            </div>
            <div className="lg:w-96">
              <div className="h-72 skeleton rounded-[var(--radius-xl)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom page-padding">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 lg:mb-10">
          <span className="font-body text-[11px] uppercase tracking-[0.14em] text-[var(--color-primary)] font-semibold">
            Your Cart
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">
            Shopping Cart
          </h1>
          <p className="font-body text-sm text-[var(--color-text-secondary)] mt-2">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] overflow-hidden">
              <div className="divide-y divide-[var(--color-border)]">
                {items.map((item) => (
                  <div key={item.id} className="p-5 lg:p-6 transition-opacity duration-300">
                    <CartItem
                      item={item}
                      onUpdateQuantity={updateItemQuantity}
                      onRemove={removeItemFromCart}
                      isUpdating={isUpdatingCart}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary - Desktop */}
            <div className="hidden lg:block lg:w-96">
              <CartSummary
                subtotal={subtotal}
                shippingCost={shippingCost}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
                itemCount={totalItems}
                onCheckout={() => navigate(ROUTES.CHECKOUT)}
              />
            </div>
          </div>
        )}

        {/* Sticky Mobile Bottom Bar */}
        {items.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[var(--shadow-elevated)] z-40 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-body uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Total</p>
                <p className="text-lg font-display font-bold text-[var(--color-primary)]">{formatPrice(totalAmount)}</p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.CHECKOUT)}
                className="flex-1 max-w-[200px] h-12 gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;