import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { Order, CheckoutData, CheckoutResponse } from '../../../types';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CheckoutResponse, CheckoutData>({
      query: (data) => ({
        url: API_ENDPOINTS.ORDERS.CHECKOUT,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    getMyOrders: builder.query<{ orders: Order[]; pagination: any }, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) =>
        `${API_ENDPOINTS.ORDERS.MY_ORDERS}?page=${page}&page_size=${pageSize}`,
      providesTags: ['Order'],
    }),
    getOrderDetail: builder.query<Order, string>({
      query: (id) => API_ENDPOINTS.ORDERS.DETAIL(id),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation<Order, { orderId: string; reason?: string }>({
      query: ({ orderId, reason }) => ({
        url: API_ENDPOINTS.ORDERS.CANCEL(orderId),
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderDetailQuery,
  useCancelOrderMutation,
} = orderApi;