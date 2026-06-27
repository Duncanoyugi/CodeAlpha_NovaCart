import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatPrice } from '../../../utils';
import type { DashboardStats } from '../../../types';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  accent: string;
}> = ({ title, value, icon, change, changeLabel, accent }) => (
  <div className="group relative bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {title}
        </p>
        <p className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
          {value}
        </p>
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {change >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[var(--color-danger)]" />
            )}
            <span className={`font-ui text-xs font-medium ${change >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
              {Math.abs(change)}% {changeLabel || 'vs last week'}
            </span>
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-[var(--radius-lg)] ${accent}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const AdminStats: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats.total_revenue), icon: <DollarSign className="w-5 h-5 text-white" />, change: stats.revenue_growth, changeLabel: 'vs last week', accent: 'bg-[var(--color-primary)]' },
    { title: 'Total Orders', value: stats.total_orders.toLocaleString(), icon: <ShoppingBag className="w-5 h-5 text-white" />, accent: 'bg-[var(--color-accent)]' },
    { title: 'Avg. Order Value', value: formatPrice(stats.average_order_value), icon: <DollarSign className="w-5 h-5 text-white" />, accent: 'bg-[#6366f1]' },
    { title: 'Customers', value: stats.total_customers.toLocaleString(), icon: <Users className="w-5 h-5 text-white" />, accent: 'bg-[#8b5cf6]' },
    { title: 'Products', value: stats.total_products.toLocaleString(), icon: <Package className="w-5 h-5 text-white" />, accent: 'bg-[#0ea5e9]' },
    { title: 'Out of Stock', value: stats.out_of_stock.toLocaleString(), icon: <Package className="w-5 h-5 text-white" />, accent: 'bg-[var(--color-danger)]' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card, index) => <StatCard key={index} {...card} />)}
    </div>
  );
};
