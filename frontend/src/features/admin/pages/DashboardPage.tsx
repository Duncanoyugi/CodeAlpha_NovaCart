import React from 'react';
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
    <div className="space-y-8">
      <div>
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Overview</span>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mt-2">Dashboard</h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {stats && <AdminStats stats={stats} />}

      {salesData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] mb-4">Revenue Overview</h3>
            <SalesChart data={salesData} title="Revenue Overview" dataKey="revenue" color="var(--color-gold-400)" />
          </div>
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] mb-4">Order Volume</h3>
            <SalesChart data={salesData} title="Order Volume" dataKey="orders" color="var(--color-text-secondary)" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
          <h3 className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] mb-4">Top Selling Products</h3>
          <TopProductsTable products={topProducts || []} isLoading={productsLoading} />
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
          <h3 className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] mb-4">Recent Orders</h3>
          <RecentOrdersTable orders={stats?.recent_orders || []} isLoading={false} />
        </div>
      </div>
    </div>
  );
};
