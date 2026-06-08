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
  color: string;
}> = ({ title, value, icon, change, changeLabel, color }) => (
  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">{title}</p>
        <p className="font-display text-2xl font-bold text-[var(--color-text-primary)] mt-1">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change >= 0 ? <TrendingUp className="w-4 h-4 text-[var(--color-success-text)]" /> : <TrendingDown className="w-4 h-4 text-[var(--color-danger-text)]" />}
            <span className={`font-ui text-xs ${change >= 0 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
              {Math.abs(change)}% {changeLabel || 'vs last week'}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    </div>
  </div>
);

export const AdminStats: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats.total_revenue), icon: <DollarSign className="w-6 h-6 text-white" />, change: stats.revenue_growth, changeLabel: 'vs last week', color: 'bg-[var(--color-gold-600)]' },
    { title: 'Total Orders', value: stats.total_orders, icon: <ShoppingBag className="w-6 h-6 text-white" />, color: 'bg-[var(--color-text-secondary)]' },
    { title: 'Avg. Order Value', value: formatPrice(stats.average_order_value), icon: <DollarSign className="w-6 h-6 text-white" />, color: 'bg-[var(--color-text-accent)]' },
    { title: 'Customers', value: stats.total_customers, icon: <Users className="w-6 h-6 text-white" />, color: 'bg-[var(--color-text-tertiary)]' },
    { title: 'Products', value: stats.total_products, icon: <Package className="w-6 h-6 text-white" />, color: 'bg-[var(--color-border-strong)]' },
    { title: 'Out of Stock', value: stats.out_of_stock, icon: <Package className="w-6 h-6 text-white" />, color: 'bg-[var(--color-danger-text)]' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => <StatCard key={index} {...card} />)}
    </div>
  );
};
