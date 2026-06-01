import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';
import { MainLayout } from '../../../layouts/MainLayout';
import { useGetOrderDetailQuery } from '../../orders/api/orderApi';
import { ROUTES } from '../../../utils/constants';
import { formatPrice } from '../../../utils';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { data: order, isLoading } = useGetOrderDetailQuery(orderId || '', {
    skip: !orderId,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to={ROUTES.HOME} className="btn-primary">
            Return Home
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-500 mb-6">
            Your order has been successfully placed. We'll send you a confirmation email shortly.
          </p>

          {/* Order Info Card */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="font-mono font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-xl font-bold text-primary-600">{formatPrice(order.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <p className="capitalize">{order.payment_status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Status</p>
                <p className="capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-gray-500">
                    We've sent order details to your email address
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-gray-500">
                    We'll notify you when your order is ready to ship
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium">Track Your Order</p>
                  <p className="text-sm text-gray-500">
                    You can track your order status from your account
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.ORDERS} className="btn-primary">
              View My Orders
            </Link>
            <Link to={ROUTES.PRODUCTS} className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};