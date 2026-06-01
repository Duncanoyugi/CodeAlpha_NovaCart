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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeLabel, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}% {changeLabel || 'vs last week'}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    </div>
  </div>
);

interface AdminStatsProps {
  stats: DashboardStats;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.total_revenue),
      icon: <DollarSign className="w-6 h-6 text-white" />,
      change: stats.revenue_growth,
      changeLabel: 'vs last week',
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: <ShoppingBag className="w-6 h-6 text-white" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Average Order Value',
      value: formatPrice(stats.average_order_value),
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Customers',
      value: stats.total_customers,
      icon: <Users className="w-6 h-6 text-white" />,
      change: ((stats.new_customers / stats.total_customers) * 100),
      changeLabel: 'new this week',
      color: 'bg-yellow-500',
    },
    {
      title: 'Products',
      value: stats.total_products,
      icon: <Package className="w-6 h-6 text-white" />,
      color: 'bg-indigo-500',
    },
    {
      title: 'Out of Stock',
      value: stats.out_of_stock,
      icon: <Package className="w-6 h-6 text-white" />,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};