import { apiSlice } from '../../../redux/api/apiSlice';
import type { User, UpdateProfileData, ChangePasswordData } from '../../../types';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileData>({
      query: (data) => ({
        url: '/auth/me/',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordData>({
      query: (data) => ({
        url: '/auth/change-password/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi;