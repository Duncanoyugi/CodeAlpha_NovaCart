import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { Review, ReviewStats, CreateReviewData, UpdateReviewData } from '../../../types';

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      { reviews: Review[]; pagination: any },
      { productId: string; page?: number; rating?: number; sort_by?: string }
    >({
      query: ({ productId, ...params }) => ({
        url: API_ENDPOINTS.REVIEWS.PRODUCT(productId),
        params,
      }),
      providesTags: ['Review'],
    }),
    getReviewStats: builder.query<ReviewStats, string>({
      query: (productId) => API_ENDPOINTS.REVIEWS.STATISTICS(productId),
      providesTags: ['Review'],
    }),
    createReview: builder.mutation<Review, CreateReviewData>({
      query: (data) => ({
        url: API_ENDPOINTS.REVIEWS.CREATE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
    updateReview: builder.mutation<Review, { reviewId: string; data: UpdateReviewData }>({
      query: ({ reviewId, data }) => ({
        url: `/reviews/${reviewId}/update/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
    markReviewHelpful: builder.mutation<Review, { reviewId: string; is_helpful: boolean }>({
      query: ({ reviewId, is_helpful }) => ({
        url: API_ENDPOINTS.REVIEWS.HELPFUL(reviewId),
        method: 'POST',
        body: { is_helpful },
      }),
      invalidatesTags: ['Review'],
    }),
    // Admin endpoints
    getAdminPendingReviews: builder.query<Review[], void>({
      query: () => '/reviews/admin/pending/',
      providesTags: ['Review'],
    }),
    getAdminAllReviews: builder.query<{ reviews: Review[]; pagination: any }, AdminUserFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `/reviews/admin/all/?${params.toString()}`;
      },
      providesTags: ['Review'],
    }),
    adminReviewAction: builder.mutation<Review, { reviewId: string; action: string; admin_response?: string }>({
      query: ({ reviewId, action, admin_response }) => ({
        url: `/reviews/admin/${reviewId}/action/`,
        method: 'POST',
        body: { action, admin_response },
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
});

interface AdminUserFilters {
  search?: string;
  page?: number;
  page_size?: number;
}

export const {
  useGetProductReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useGetAdminPendingReviewsQuery,
  useGetAdminAllReviewsQuery,
  useAdminReviewActionMutation,
} = reviewApi;