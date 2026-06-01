import React from 'react';
import { Link } from 'react-router-dom';
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
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No product data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SKU</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Units Sold</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition">
              <td className="py-3 px-4">
                <Link
                  to={`/admin/products/${product.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {product.name}
                </Link>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">{product.sku}</td>
              <td className="py-3 px-4 text-right font-medium">{formatPrice(product.price)}</td>
              <td className="py-3 px-4 text-right">{product.total_sold}</td>
              <td className="py-3 px-4 text-right font-semibold">
                {formatPrice(product.total_revenue)}
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    product.stock > 10
                      ? 'bg-green-100 text-green-700'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
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