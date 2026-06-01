import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type {
  DashboardStats,
  SalesDataPoint,
  TopProduct,
  CategorySales,
  CustomerInsights,
  InventoryStatus,
  AdminProductFilters,
  AdminOrderFilters,
  AdminUserFilters,
  Product,
  Category,
  Order,
  User,
  ProductVariant,
} from '../../../types';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Analytics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => API_ENDPOINTS.ADMIN.DASHBOARD,
      providesTags: ['Order', 'Product', 'User'],
    }),
    getSalesOverview: builder.query<SalesDataPoint[], { days?: number }>({
      query: ({ days = 30 }) => `${API_ENDPOINTS.ADMIN.SALES_OVERVIEW}?days=${days}`,
      providesTags: ['Order'],
    }),
    getTopProducts: builder.query<TopProduct[], { limit?: number; days?: number }>({
      query: ({ limit = 10, days = 30 }) =>
        `${API_ENDPOINTS.ADMIN.TOP_PRODUCTS}?limit=${limit}&days=${days}`,
      providesTags: ['Product', 'Order'],
    }),
    getCategorySales: builder.query<CategorySales[], { days?: number }>({
      query: ({ days = 30 }) => `/analytics/category-sales/?days=${days}`,
      providesTags: ['Order', 'Product'],
    }),
    getCustomerInsights: builder.query<CustomerInsights, void>({
      query: () => '/analytics/customer-insights/',
      providesTags: ['User', 'Order'],
    }),
    getInventoryStatus: builder.query<InventoryStatus, void>({
      query: () => '/analytics/inventory-status/',
      providesTags: ['Product'],
    }),

    // Product Management
    getAdminProducts: builder.query<{ products: Product[]; pagination: any }, AdminProductFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `/products/admin/products/?${params.toString()}`;
      },
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        url: '/products/admin/products/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/products/admin/products/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/admin/products/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    updateInventory: builder.mutation<
      { stock_quantity: number; is_available: boolean },
      { id: string; stock_quantity: number }
    >({
      query: ({ id, stock_quantity }) => ({
        url: `/products/admin/products/${id}/inventory/`,
        method: 'POST',
        body: { stock_quantity },
      }),
      invalidatesTags: ['Product'],
    }),

    // Category Management
    getCategories: builder.query<Category[], void>({
      query: () => '/products/categories/',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (data) => ({
        url: '/products/admin/categories/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/products/admin/categories/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/admin/categories/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Order Management
    getAdminOrders: builder.query<{ orders: Order[]; pagination: any }, AdminOrderFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `${API_ENDPOINTS.ADMIN.ORDERS}?${params.toString()}`;
      },
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<
      Order,
      { orderId: string; status: string; admin_notes?: string; tracking_number?: string; carrier?: string; estimated_delivery?: string }
    >({
      query: ({ orderId, ...data }) => ({
        url: API_ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(orderId),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    // User Management
    getAdminUsers: builder.query<{ users: User[]; pagination: any }, AdminUserFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `/users/admin/users/?${params.toString()}`;
      },
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation<User, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/admin/users/${userId}/role/`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    toggleUserStatus: builder.mutation<User, { userId: string; is_active: boolean }>({
      query: ({ userId, is_active }) => ({
        url: `/users/admin/users/${userId}/toggle-status/`,
        method: 'PUT',
        body: { is_active },
      }),
      invalidatesTags: ['User'],
    }),
    verifyUser: builder.mutation<User, { userId: string; is_verified: boolean }>({
      query: ({ userId, is_verified }) => ({
        url: `/users/admin/users/${userId}/verify/`,
        method: 'PUT',
        body: { is_verified },
      }),
      invalidatesTags: ['User'],
    }),

    createProductVariant: builder.mutation<ProductVariant, { productId: string; data: Partial<ProductVariant> }>({
      query: ({ productId, data }) => ({
        url: `/products/admin/products/${productId}/variants/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProductVariant: builder.mutation<ProductVariant, { variantId: string; data: Partial<ProductVariant> }>({
      query: ({ variantId, data }) => ({
        url: `/products/admin/variants/${variantId}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProductVariant: builder.mutation<void, string>({
      query: (variantId) => ({
        url: `/products/admin/variants/${variantId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Bulk actions
    bulkDeleteProducts: builder.mutation<void, string[]>({
      query: (productIds) => ({
        url: '/products/admin/products/bulk-delete/',
        method: 'POST',
        body: { product_ids: productIds },
      }),
      invalidatesTags: ['Product'],
    }),

    bulkUpdateAvailability: builder.mutation<void, { productIds: string[]; is_available: boolean }>({
      query: ({ productIds, is_available }) => ({
        url: '/products/admin/products/bulk-availability/',
        method: 'POST',
        body: { product_ids: productIds, is_available },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  // Dashboard
  useGetDashboardStatsQuery,
  useGetSalesOverviewQuery,
  useGetTopProductsQuery,
  useGetCategorySalesQuery,
  useGetCustomerInsightsQuery,
  useGetInventoryStatusQuery,

  // Product Management
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateInventoryMutation,

  // Category Management
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Order Management
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,

  // User Management
  useGetAdminUsersQuery,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  useBulkDeleteProductsMutation,
  useBulkUpdateAvailabilityMutation,
} = adminApi;