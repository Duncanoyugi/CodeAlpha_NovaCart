import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import type { Product } from '../../../types';
import { formatPrice } from '../../../utils';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useDeleteProductMutation, useUpdateInventoryMutation } from '../api/adminApi';
import { Button } from '../../../components/common/Button';

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

  return (
    <>
      <tr className="group hover:bg-[var(--color-bg-muted)] transition-colors duration-150">
        <td className="py-4 px-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="h-4 w-4 rounded border-[var(--color-border-medium)] accent-[var(--color-primary)] cursor-pointer"
          />
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-light)] group-hover:border-[var(--color-border-medium)] transition-colors">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-ui text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[200px] group-hover:text-[var(--color-primary)] transition-colors">
                {product.name}
              </p>
              <p className="font-ui text-[11px] text-[var(--color-text-muted)] font-mono">
                {product.sku}
              </p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className="font-ui text-sm text-[var(--color-text-secondary)]">
            {product.category_name || '—'}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="font-ui text-sm font-semibold text-[var(--color-primary)]">
            {formatPrice(product.price)}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickStockUpdate(-1)}
              disabled={isUpdatingStock || product.stock_quantity <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-medium)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-ui text-sm font-medium"
            >
              −
            </button>
            <span className="w-10 text-center font-ui text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
              {product.stock_quantity}
            </span>
            <button
              onClick={() => handleQuickStockUpdate(1)}
              disabled={isUpdatingStock}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-medium)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-ui text-sm font-medium"
            >
              +
            </button>
          </div>
        </td>
        <td className="py-4 px-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${
              product.is_available
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]'
                : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${product.is_available ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`} />
            {product.is_available ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="!p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)]"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="!p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
