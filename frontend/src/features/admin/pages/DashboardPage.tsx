import React from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { AdminStats } from '../components/AdminStats';
import { SalesChart } from '../components/SalesChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import {
  useGetDashboardStatsQuery,
  useGetSalesOverviewQuery,
  useGetTopProductsQuery,
} from '../api/adminApi';

export const DashboardPage: React.FC = () => {
  const [days] = React.useState(30);
  
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: salesData } = useGetSalesOverviewQuery({ days });
  const { data: topProducts, isLoading: productsLoading } = useGetTopProductsQuery({ limit: 5, days });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Cards */}
        {stats && <AdminStats stats={stats} />}

        {/* Sales Chart */}
        {salesData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart
              data={salesData}
              title="Revenue Overview"
              dataKey="revenue"
              color="#3b82f6"
            />
            <SalesChart
              data={salesData}
              title="Order Volume"
              dataKey="orders"
              color="#10b981"
            />
          </div>
        )}

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <TopProductsTable products={topProducts || []} isLoading={productsLoading} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <RecentOrdersTable orders={stats?.recent_orders || []} isLoading={false} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};