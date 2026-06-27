import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SalesDataPoint } from '../../../types';

interface SalesChartProps {
  data: SalesDataPoint[];
  title: string;
  dataKey: 'revenue' | 'orders';
  color: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  title,
  dataKey,
  color,
}) => {
  const formatYAxis = (value: number) => {
    if (dataKey === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const formatTooltipValue = (value: number) => {
    if (dataKey === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return `${value} orders`;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="var(--color-text-muted)"
          fontSize={11}
          fontFamily="var(--font-body)"
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border-light)' }}
          tick={{ fill: 'var(--color-text-muted)' }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          stroke="var(--color-text-muted)"
          fontSize={11}
          fontFamily="var(--font-body)"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-text-muted)' }}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-light)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}
          formatter={(value: any) => [formatTooltipValue(Number(value ?? 0)), title]}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#gradient-${dataKey})`}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
