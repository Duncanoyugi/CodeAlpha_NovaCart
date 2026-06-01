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
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetReviewStatsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
} = reviewApi;