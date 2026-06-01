import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { CreatePaymentIntentData, ConfirmPaymentData, PaymentIntent, PaymentResult } from '../../../types';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<PaymentIntent, CreatePaymentIntentData>({
      query: (data) => ({
        url: API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
        method: 'POST',
        body: data,
      }),
    }),
    confirmPayment: builder.mutation<PaymentResult, ConfirmPaymentData>({
      query: (data) => ({
        url: API_ENDPOINTS.PAYMENTS.CONFIRM,
        method: 'POST',
        body: data,
      }),
    }),
    getPaymentStatus: builder.query<PaymentIntent, string>({
      query: (paymentIntentId) => API_ENDPOINTS.PAYMENTS.STATUS(paymentIntentId),
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useGetPaymentStatusQuery,
} = paymentApi;