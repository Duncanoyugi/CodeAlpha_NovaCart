import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductTableRow } from '../components/ProductTableRow';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useGetAdminProductsQuery, useBulkDeleteProductsMutation, useBulkUpdateAvailabilityMutation } from '../api/adminApi';
import { Pagination } from '../../../components/common/Pagination';
import type { Product } from '../../../types';

export const ProductsManagementPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkStatusAction, setBulkStatusAction] = useState<boolean>(true);
  const { data, isLoading, refetch } = useGetAdminProductsQuery({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const [bulkDelete, { isLoading: isDeleting }] = useBulkDeleteProductsMutation();
  const [bulkUpdateStatus] = useBulkUpdateAvailabilityMutation();

  const products = data?.products || [];
  const pagination = data?.pagination;

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    refetch();
    setEditingProduct(undefined);
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedProducts).unwrap();
      setSelectedProducts([]);
      refetch();
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkStatusUpdate = async () => {
    try {
      await bulkUpdateStatus({
        productIds: selectedProducts,
        is_available: bulkStatusAction,
      }).unwrap();
      setSelectedProducts([]);
      refetch();
      setShowBulkStatusModal(false);
    } catch (error) {
      console.error('Bulk status update failed:', error);
    }
  };

  useEffect(() => {
    setSelectedProducts([]);
  }, [page, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Management
          </span>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] tracking-tight mt-1">
            Products
          </h1>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(undefined);
            setShowFormModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-ui text-sm font-semibold shadow-[var(--shadow-sm)] hover:brightness-110 hover:shadow-[var(--shadow-md)] transition-all duration-150 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] pl-11 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-52 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 appearance-none transition-all cursor-pointer"
          >
            <option value="all">All Products</option>
            <option value="available">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)]">
          <span className="font-ui text-sm font-medium text-[var(--color-text-secondary)]">
            <span className="font-bold text-[var(--color-text-primary)]">{selectedProducts.length}</span> product{selectedProducts.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setBulkStatusAction(true);
                setShowBulkStatusModal(true);
              }}
              className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)] font-ui text-sm font-semibold hover:brightness-95 transition-all"
            >
              Mark Available
            </button>
            <button
              onClick={() => {
                setBulkStatusAction(false);
                setShowBulkStatusModal(true);
              }}
              className="px-4 py-2 rounded-[var(--radius-md)] bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-ui text-sm font-semibold hover:brightness-95 transition-all"
            >
              Mark Unavailable
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)] font-ui text-sm font-semibold hover:brightness-95 transition-all"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-light)]">
                <th className="py-3.5 px-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-[var(--color-border-medium)] accent-[var(--color-primary)] cursor-pointer"
                  />
                </th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Product</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Category</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Price</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Stock</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Status</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] animate-pulse" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-muted)] mb-3">
                        <span className="text-[var(--color-text-muted)] font-bold text-sm">0</span>
                      </div>
                      <p className="font-ui text-sm text-[var(--color-text-muted)]">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.includes(product.id)}
                    onSelect={handleSelectProduct}
                    onEdit={handleEdit}
                    onRefresh={refetch}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-5 border-t border-[var(--color-border-light)] bg-[var(--color-bg-surface)]">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingProduct(undefined);
        }}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <DeleteConfirmModal
        isOpen={showBulkStatusModal}
        onClose={() => setShowBulkStatusModal(false)}
        onConfirm={handleBulkStatusUpdate}
        title={`${bulkStatusAction ? 'Mark Available' : 'Mark Unavailable'}`}
        message={`Are you sure you want to ${bulkStatusAction ? 'mark available' : 'mark unavailable'} ${selectedProducts.length} product(s)?`}
      />
    </div>
  );
};
