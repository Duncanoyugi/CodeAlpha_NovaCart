import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type {
  CheckoutData,
  CheckoutResponse,
  PaymentIntent,
  ConfirmPaymentData,
  CreatePaymentIntentData,
} from '../../../types';

export const checkoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation<CheckoutResponse, CheckoutData>({
      query: (data) => ({
        url: API_ENDPOINTS.ORDERS.CHECKOUT,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),

    createPaymentIntent: builder.mutation<PaymentIntent, CreatePaymentIntentData>({
      query: (data) => ({
        url: API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
        method: 'POST',
        body: data,
      }),
    }),

    confirmPayment: builder.mutation<unknown, ConfirmPaymentData>({
      query: (data) => ({
        url: API_ENDPOINTS.PAYMENTS.CONFIRM,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCheckoutMutation,
  useCreatePaymentIntentMutation: useCheckoutCreatePaymentIntentMutation,
  useConfirmPaymentMutation: useCheckoutConfirmPaymentMutation,
} = checkoutApi;

