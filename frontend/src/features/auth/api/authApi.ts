import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import { tokenService } from '../../../services/tokenService';
import { setUser } from '../../../redux/slices/authSlice';
import type { LoginCredentials, RegisterData, VerifyOTPData, AuthResponse, User } from '../../../types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      // backend returns { success, message, data: { user, tokens } }
      // normalize to return the inner `data` object directly
      transformResponse: (response: any) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.tokens) {
            tokenService.setTokens(data.tokens.access, data.tokens.refresh);
          }
          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch (err) {
          // swallow - errors handled by callers
        }
      },
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
      transformResponse: (response: any) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.tokens) {
            tokenService.setTokens(data.tokens.access, data.tokens.refresh);
          }
          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch (err) {
          // ignore
        }
      },
    }),
    resendOTP: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.RESEND_OTP,
        method: 'POST',
        body: data,
      }),
    }),
    resendWelcome: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.RESEND_WELCOME,
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
  useResendWelcomeMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;