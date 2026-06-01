import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { OrderCard } from '../../../components/order/OrderCard';
import { Pagination } from '../../../components/common/Pagination';
import { useGetMyOrdersQuery } from '../api/orderApi';
import { ROUTES } from '../../../utils/constants';

export const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyOrdersQuery({ page, pageSize: 10 });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 rounded" />
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
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};