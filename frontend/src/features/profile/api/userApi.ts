import { apiSlice } from '../../../redux/api/apiSlice';
import type { ApiResponse, ChangePasswordData, UpdateProfileData, User, UserAddress } from '../../../types';

type AddressInput = Omit<UserAddress, 'id' | 'created_at'>;

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => '/users/me/profile/',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, UpdateProfileData>({
      query: (data) => ({
        url: '/users/me/profile/',
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordData>({
      query: (data) => ({
        url: '/users/change-password/',
        method: 'POST',
        body: {
          current_password: data.old_password,
          new_password: data.new_password,
          new_password2: data.confirm_password,
        },
      }),
    }),
    getAddresses: builder.query<UserAddress[], void>({
      query: () => '/users/addresses/',
      transformResponse: (response: ApiResponse<UserAddress[]>) => response.data,
      providesTags: ['User'],
    }),
    createAddress: builder.mutation<UserAddress, AddressInput>({
      query: (body) => ({
        url: '/users/addresses/',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<UserAddress>) => response.data,
      invalidatesTags: ['User'],
    }),
    updateAddress: builder.mutation<UserAddress, Partial<AddressInput> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/users/addresses/${id}/`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<UserAddress>) => response.data,
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/users/addresses/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    uploadAvatar: builder.mutation<User, File>({
      query: (file) => {
        const body = new FormData();
        body.append('avatar', file);
        return {
          url: '/users/avatar/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useUploadAvatarMutation,
} = userApi;
