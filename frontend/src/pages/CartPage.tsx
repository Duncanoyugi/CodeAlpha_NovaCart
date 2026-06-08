import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { CartEmpty } from '../components/cart/CartEmpty';
import { useCart } from '../features/cart';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from '../utils/constants';

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

  const handleCheckout = () => {
    if (totalItems > 0) {
      navigate(ROUTES.CHECKOUT);
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="h-6 w-48 skeleton rounded mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[var(--color-text-primary)]">Shopping Cart</h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-2">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
      </div>

      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="divide-y divide-[var(--color-border-light)]">
              {items.map((item) => (
                <div key={item.id} className="p-6">
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

          {/* Order Summary */}
          <div className="lg:w-96">
            <CartSummary
              subtotal={subtotal}
              shippingCost={shippingCost}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              itemCount={totalItems}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}
    </div>
  );
};