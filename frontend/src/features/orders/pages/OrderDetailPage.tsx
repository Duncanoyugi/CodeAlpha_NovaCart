import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { OrderStatus } from '../../../components/order/OrderStatus';
import { OrderItems } from '../../../components/order/OrderItems';
import { OrderSummary } from '../../../components/order/OrderSummary';
import { useGetOrderDetailQuery } from '../api/orderApi';
import { ROUTES } from '../../../utils/constants';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrderDetailQuery(id || '', {
    skip: !id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="space-y-4">
              <div className="h-64 bg-gray-100 rounded" />
              <div className="h-40 bg-gray-100 rounded" />
            </div>
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
          <Link to={ROUTES.ORDERS} className="btn-primary">
            View All Orders
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
            <p className="text-gray-500">Placed on {new Date(order.placed_at).toLocaleDateString()}</p>
          </div>
          <Link to={ROUTES.ORDERS} className="text-primary-600 hover:text-primary-700">
            Back to Orders
          </Link>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <OrderStatus order={order} />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <OrderItems order={order} />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <OrderSummary order={order} />
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;