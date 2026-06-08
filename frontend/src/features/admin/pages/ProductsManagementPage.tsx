import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
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

  // Select/Deselect all
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

  // Reset selected when products change (page change)
  useEffect(() => {
    setSelectedProducts([]);
  }, [page, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(undefined);
            setShowFormModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Products</option>
          <option value="available">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-primary-700">
            {selectedProducts.length} product(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setBulkStatusAction(true);
                setShowBulkStatusModal(true);
              }}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Mark Available
            </button>
            <button
              onClick={() => {
                setBulkStatusAction(false);
                setShowBulkStatusModal(true);
              }}
              className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Mark Unavailable
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="animate-pulse">Loading products...</div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No products found
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
          <div className="px-6 py-4 border-t">
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