import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenService } from '../../services/tokenService';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = tokenService.getAccessToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Product', 'Category', 'Cart', 'Order', 'Review', 'Wishlist'],
  endpoints: () => ({}),
});