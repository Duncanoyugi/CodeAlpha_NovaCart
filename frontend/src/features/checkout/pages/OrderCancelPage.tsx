import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ShoppingBag } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout';
import { ROUTES } from '../../../utils/constants';

export const OrderCancelPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
          <p className="text-gray-500 mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <div className="space-y-3">
            <Link to={ROUTES.CART} className="btn-primary block">
              Return to Cart
            </Link>
            <Link to={ROUTES.PRODUCTS} className="btn-secondary block flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};