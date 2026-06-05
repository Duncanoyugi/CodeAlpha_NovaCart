import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { Wishlist, WishlistItem } from '../../../types';

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<Wishlist, void>({
      query: () => API_ENDPOINTS.WISHLIST.GET,
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<WishlistItem, string>({
      query: (productId) => ({
        url: API_ENDPOINTS.WISHLIST.ADD,
        method: 'POST',
        body: { product_id: productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<void, string>({
      query: (productId) => ({
        url: API_ENDPOINTS.WISHLIST.REMOVE(productId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    clearWishlist: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.WISHLIST.CLEAR,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    checkInWishlist: builder.query<{ in_wishlist: boolean }, string>({
      query: (productId) => API_ENDPOINTS.WISHLIST.CHECK(productId),
      providesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useCheckInWishlistQuery,
} = wishlistApi;