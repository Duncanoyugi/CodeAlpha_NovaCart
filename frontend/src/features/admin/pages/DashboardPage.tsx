import React from 'react';
import { AdminStats } from '../components/AdminStats';
import { SalesChart } from '../components/SalesChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import {
  useGetDashboardStatsQuery,
  useGetSalesOverviewQuery,
  useGetTopProductsQuery,
  useGetRecentOrdersQuery,
} from '../api/adminApi';

const POLLING_INTERVAL = 30000;

export const DashboardPage: React.FC = () => {
  const [days] = React.useState(30);
  const { data: stats } = useGetDashboardStatsQuery(void 0, { pollingInterval: POLLING_INTERVAL });
  const { data: salesData } = useGetSalesOverviewQuery({ days }, { pollingInterval: POLLING_INTERVAL });
  const { data: topProducts, isLoading: productsLoading } = useGetTopProductsQuery({ limit: 5, days }, { pollingInterval: POLLING_INTERVAL });
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrdersQuery({ limit: 5 }, { pollingInterval: POLLING_INTERVAL });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Overview
        </span>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
          Dashboard
        </h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">
          Welcome back. Here's what's happening with your store today.
        </p>
      </div>

      {stats && <AdminStats stats={stats} />}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              Revenue Overview
            </h3>
            <span className="font-ui text-[11px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-2.5 py-1 rounded-full">
              Last {days} days
            </span>
          </div>
          {salesData && (
            <SalesChart data={salesData} title="Revenue Overview" dataKey="revenue" color="var(--color-primary)" />
          )}
        </div>
        <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              Order Volume
            </h3>
            <span className="font-ui text-[11px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-2.5 py-1 rounded-full">
              Last {days} days
            </span>
          </div>
          {salesData && (
            <SalesChart data={salesData} title="Order Volume" dataKey="orders" color="var(--color-accent)" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--color-border-light)]">
            <h3 className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              Top Selling Products
            </h3>
          </div>
          <div className="p-6">
            <TopProductsTable products={topProducts || []} isLoading={productsLoading} />
          </div>
        </div>
        <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--color-border-light)]">
            <h3 className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              Recent Orders
            </h3>
          </div>
          <div className="p-6">
            <RecentOrdersTable orders={recentOrders || []} isLoading={ordersLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};
