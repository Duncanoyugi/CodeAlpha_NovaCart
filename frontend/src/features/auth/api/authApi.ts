import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { LoginCredentials, RegisterData, VerifyOTPData, AuthResponse, User } from '../../../types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<{ email: string; full_name: string }, RegisterData>({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),
    verifyOTP: builder.mutation<AuthResponse, VerifyOTPData>({
      query: (otpData) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_OTP,
        method: 'POST',
        body: otpData,
      }),
    }),
    resendOTP: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.RESEND_OTP,
        method: 'POST',
        body: data,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;