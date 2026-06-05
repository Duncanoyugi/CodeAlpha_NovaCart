import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { Cart, AddToCartData, UpdateCartData, CartItem } from '../../../types';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => API_ENDPOINTS.CART.GET,
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<CartItem, AddToCartData>({
      query: (data) => ({
        url: API_ENDPOINTS.CART.ADD,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<CartItem, UpdateCartData>({
      query: ({ id, quantity }) => ({
        url: API_ENDPOINTS.CART.UPDATE(id),
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.CART.REMOVE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.CART.CLEAR,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    mergeCart: builder.mutation<{ success: boolean; message: string }, { session_key: string }>({
      query: (data) => ({
        url: API_ENDPOINTS.CART.MERGE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useMergeCartMutation,
} = cartApi;