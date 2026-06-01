import React, { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Product } from '../../../types';
import { formatPrice } from '../../../utils';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useDeleteProductMutation, useUpdateInventoryMutation } from '../api/adminApi';

interface ProductTableRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  isSelected,
  onSelect,
  onEdit,
  onRefresh,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateInventory] = useUpdateInventoryMutation();

  const handleQuickStockUpdate = async (increment: number) => {
    const newStock = product.stock_quantity + increment;
    if (newStock < 0) return;
    
    setIsUpdatingStock(true);
    try {
      await updateInventory({ id: product.id, stock_quantity: newStock }).unwrap();
      onRefresh();
    } catch (error) {
      console.error('Failed to update stock:', error);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id).unwrap();
      onRefresh();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await updateInventory({ 
        id: product.id, 
        stock_quantity: product.stock_quantity 
      }).unwrap();
      onRefresh();
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition">
        <td className="py-3 px-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <p className="font-medium text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-400">SKU: {product.sku}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">{product.category?.name || 'N/A'}</td>
        <td className="py-3 px-4 font-semibold">{formatPrice(product.price)}</td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickStockUpdate(-1)}
              disabled={isUpdatingStock || product.stock_quantity <= 0}
              className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{product.stock_quantity}</span>
            <button
              onClick={() => handleQuickStockUpdate(1)}
              disabled={isUpdatingStock}
              className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </td>
        <td className="py-3 px-4">
          <button
            onClick={handleToggleAvailability}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              product.is_available
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {product.is_available ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            {product.is_available ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};