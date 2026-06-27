import React from 'react';
import { formatPrice } from '../../../utils';
import type { TopProduct } from '../../../types';

interface TopProductsTableProps {
  products: TopProduct[];
  isLoading?: boolean;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-muted)] mb-3">
          <span className="text-[var(--color-text-muted)] text-xs font-bold">0</span>
        </div>
        <p className="font-ui text-sm text-[var(--color-text-muted)]">No sales data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-light)]">
            <th className="text-left py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Product
            </th>
            <th className="text-right py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Sold
            </th>
            <th className="text-right py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Revenue
            </th>
            <th className="text-right py-3 px-1 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Stock
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-light)]">
          {products.map((product, index) => (
            <tr key={product.id} className="group hover:bg-[var(--color-bg-muted)] transition-colors duration-150">
              <td className="py-3.5 px-1">
                <div className="flex items-center gap-3">
                  <span className="font-ui text-xs font-bold text-[var(--color-text-muted)] w-4">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-ui text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                      {product.name}
                    </p>
                    <p className="font-ui text-[11px] text-[var(--color-text-muted)] font-mono">
                      {product.sku}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-1 text-right">
                <span className="font-ui text-sm font-medium text-[var(--color-text-primary)]">
                  {product.total_sold.toLocaleString()}
                </span>
              </td>
              <td className="py-3.5 px-1 text-right">
                <span className="font-ui text-sm font-semibold text-[var(--color-primary)]">
                  {formatPrice(product.total_revenue)}
                </span>
              </td>
              <td className="py-3.5 px-1 text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${
                    product.stock > 10
                      ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                      : product.stock > 0
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'
                  }`}
                >
                  {product.stock} left
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
