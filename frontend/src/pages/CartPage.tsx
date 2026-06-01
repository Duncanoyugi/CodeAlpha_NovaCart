import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { CartEmpty } from '../components/cart/CartEmpty';
import { useCart } from '../features/cart';
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

  useEffect(() => {
    getCart();
  }, []);

  const handleCheckout = () => {
    if (totalItems > 0) {
      navigate(ROUTES.CHECKOUT);
    }
  };

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

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <CartEmpty />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateItemQuantity}
                  onRemove={removeItemFromCart}
                  isUpdating={isUpdatingCart}
                />
              ))}
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-6">
              <button
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                ← Continue Shopping
              </button>
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
      </div>
    </MainLayout>
  );
};