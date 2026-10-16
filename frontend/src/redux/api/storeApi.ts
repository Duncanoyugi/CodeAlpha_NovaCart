import { apiSlice } from './apiSlice';
import { API_ENDPOINTS } from '../../utils/constants';
import type { Product, Category, ProductFilters, Order, CheckoutData } from '../../types';

export interface Pagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ProductPage {
  products: Product[];
  pagination: Pagination;
}

export interface ProductDetailResult {
  product: Product;
  related_products: Product[];
}

export interface ReviewItem {
  id: string;
  user_name: string;
  user_avatar?: string | null;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  admin_response?: string;
  created_at: string;
}

export interface ReviewStatsData {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, { count: number; percentage: number }>;
  verified_purchases: number;
}

export interface PaymentConfig {
  currency: string;
  stripe_public_key: string;
  card_enabled: boolean;
  mpesa_enabled: boolean;
}

export interface MpesaStatus {
  payment_id: string;
  order_id: string;
  status: 'pending' | 'stk_sent' | 'awaiting_callback' | 'succeeded' | 'failed' | 'cancelled' | 'expired';
  order_payment_status: string;
  receipt_number?: string | null;
  result_description?: string;
}

export interface CouponPreview {
  code: string;
  description: string;
  discount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
}

export interface OrderListResult {
  orders: Order[];
  pagination: { total: number; page: number; page_size: number; total_pages: number };
}

const unwrap = <T,>(response: { data: T }) => response.data;

const buildParams = (filters: Record<string, unknown>) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    params.append(key, String(value));
  });
  return params.toString();
};

export const storeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---- catalogue
    getProducts: builder.query<ProductPage, ProductFilters>({
      query: (filters) => `${API_ENDPOINTS.PRODUCTS.LIST}?${buildParams(filters as Record<string, unknown>)}`,
      transformResponse: unwrap<ProductPage>,
      providesTags: ['Product'],
    }),
    getProductBySlug: builder.query<ProductDetailResult, string>({
      query: (slug) => API_ENDPOINTS.PRODUCTS.DETAIL(slug),
      transformResponse: unwrap<ProductDetailResult>,
      providesTags: (_r, _e, slug) => [{ type: 'Product', id: slug }],
    }),
    getCategoryTree: builder.query<Category[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.CATEGORY_TREE,
      transformResponse: unwrap<Category[]>,
      providesTags: ['Category'],
    }),
    getCategoryBySlug: builder.query<{ category: Category; breadcrumbs: Array<{ name: string; slug: string }> }, string>({
      query: (slug) => API_ENDPOINTS.PRODUCTS.CATEGORIES + slug + '/',
      transformResponse: unwrap<{ category: Category; breadcrumbs: Array<{ name: string; slug: string }> }>,
      providesTags: ['Category'],
    }),
    getFeaturedProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.FEATURED,
      transformResponse: unwrap<Product[]>,
      providesTags: ['Product'],
    }),
    getBestSellers: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.BEST_SELLING,
      transformResponse: unwrap<Product[]>,
      providesTags: ['Product'],
    }),
    getNewArrivalProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.NEW_ARRIVALS,
      transformResponse: unwrap<Product[]>,
      providesTags: ['Product'],
    }),

    // ---- reviews
    getReviews: builder.query<{ reviews: ReviewItem[] }, string>({
      query: (productId) => API_ENDPOINTS.REVIEWS.PRODUCT(productId),
      transformResponse: unwrap<{ reviews: ReviewItem[] }>,
      providesTags: ['Review'],
    }),
    getReviewStats: builder.query<ReviewStatsData, string>({
      query: (productId) => API_ENDPOINTS.REVIEWS.STATISTICS(productId),
      transformResponse: unwrap<ReviewStatsData>,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation<unknown, { product: string; rating: number; title: string; comment: string }>({
      query: (body) => ({ url: API_ENDPOINTS.REVIEWS.CREATE, method: 'POST', body }),
      invalidatesTags: ['Review'],
    }),

    // ---- wishlist
    getWishlist: builder.query<{ items: Array<{ id: string; product: string; product_details: Product }>; total_items: number }, void>({
      query: () => API_ENDPOINTS.WISHLIST.GET,
      transformResponse: unwrap<{ items: Array<{ id: string; product: string; product_details: Product }>; total_items: number }>,
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<unknown, string>({
      query: (productId) => ({ url: API_ENDPOINTS.WISHLIST.ADD, method: 'POST', body: { product_id: productId } }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<unknown, string>({
      query: (productId) => ({ url: API_ENDPOINTS.WISHLIST.REMOVE(productId), method: 'DELETE' }),
      invalidatesTags: ['Wishlist'],
    }),

    // ---- checkout & orders
    validateCoupon: builder.mutation<CouponPreview, string>({
      query: (code) => ({ url: API_ENDPOINTS.ORDERS.VALIDATE_COUPON, method: 'POST', body: { code } }),
      transformResponse: unwrap<CouponPreview>,
    }),
    placeOrder: builder.mutation<
      { order_id: string; order_number: string; total_amount: number; status: string },
      CheckoutData
    >({
      query: (body) => ({ url: API_ENDPOINTS.ORDERS.CHECKOUT, method: 'POST', body }),
      transformResponse: unwrap<{ order_id: string; order_number: string; total_amount: number; status: string }>,
      invalidatesTags: ['Cart', 'Order', 'Product'],
    }),
    getMyOrders: builder.query<OrderListResult, { page?: number; status?: string }>({
      query: ({ page = 1, status }) => `${API_ENDPOINTS.ORDERS.MY_ORDERS}?${buildParams({ page, status })}`,
      transformResponse: unwrap<OrderListResult>,
      providesTags: ['Order'],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => API_ENDPOINTS.ORDERS.DETAIL(id),
      transformResponse: unwrap<Order>,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation<unknown, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: API_ENDPOINTS.ORDERS.CANCEL(id), method: 'POST', body: { reason } }),
      invalidatesTags: ['Order', 'Product'],
    }),

    // ---- payments
    getPaymentConfig: builder.query<PaymentConfig, void>({
      query: () => API_ENDPOINTS.PAYMENTS.CONFIG,
      transformResponse: unwrap<PaymentConfig>,
    }),
    startMpesa: builder.mutation<{ payment_id: string; status: string }, { order_id: string; phone: string }>({
      query: (body) => ({ url: API_ENDPOINTS.PAYMENTS.STK_PUSH, method: 'POST', body }),
      transformResponse: unwrap<{ payment_id: string; status: string }>,
    }),
    getMpesaStatus: builder.query<MpesaStatus, string>({
      query: (paymentId) => API_ENDPOINTS.PAYMENTS.MPESA_STATUS(paymentId),
      transformResponse: unwrap<MpesaStatus>,
    }),
    createCardIntent: builder.mutation<{ client_secret: string; payment_intent_id: string }, { order_id: string }>({
      query: (body) => ({ url: API_ENDPOINTS.PAYMENTS.CREATE_INTENT, method: 'POST', body: { ...body, payment_method: 'stripe' } }),
      transformResponse: unwrap<{ client_secret: string; payment_intent_id: string }>,
    }),
    confirmCardPayment: builder.mutation<{ payment_status: string }, { payment_intent_id: string }>({
      query: (body) => ({ url: API_ENDPOINTS.PAYMENTS.CONFIRM, method: 'POST', body }),
      transformResponse: unwrap<{ payment_status: string }>,
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoryTreeQuery,
  useGetCategoryBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetBestSellersQuery,
  useGetNewArrivalProductsQuery,
  useGetReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useValidateCouponMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useGetPaymentConfigQuery,
  useStartMpesaMutation,
  useGetMpesaStatusQuery,
  useCreateCardIntentMutation,
  useConfirmCardPaymentMutation,
} = storeApi;
