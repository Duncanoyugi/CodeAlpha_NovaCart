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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#888" fontSize={12} />
          <YAxis tickFormatter={formatYAxis} stroke="#888" fontSize={12} />
          <Tooltip
            formatter={(value) => [formatTooltipValue(Number(value ?? 0)), title]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#gradient-${dataKey})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};