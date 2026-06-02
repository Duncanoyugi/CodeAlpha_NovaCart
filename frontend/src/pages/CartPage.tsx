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
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>

        {/* Benefits Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="font-semibold text-gray-900">Free delivery</p>
              <p className="text-sm text-gray-600">On orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-semibold text-gray-900">Secure checkout</p>
              <p className="text-sm text-gray-600">Protected payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-2xl border border-orange-200">
            <span className="text-2xl">↩️</span>
            <div>
              <p className="font-semibold text-gray-900">30-day returns</p>
              <p className="text-sm text-gray-600">Easy, hassle-free</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
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
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-8">
              <button
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="inline-flex items-center gap-2 text-[#ff902b] hover:text-[#e67e1f] font-semibold transition"
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