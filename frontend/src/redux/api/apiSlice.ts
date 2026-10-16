import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from '../../services/axios';
import { getErrorMessage } from '../../services/errorHandler';

type Args = string | { url: string; method?: AxiosRequestConfig['method']; body?: unknown; params?: unknown };

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
}

/**
 * RTK Query transport built on our axios instance, so RTK calls get the same
 * auth header, guest-cart key and automatic token refresh as everything else.
 */
const axiosBaseQuery =
  (): BaseQueryFn<Args, unknown, ApiError> =>
  async (args) => {
    const config: AxiosRequestConfig =
      typeof args === 'string'
        ? { url: args, method: 'GET' }
        : { url: args.url, method: args.method ?? 'GET', data: args.body, params: args.params };
    try {
      const result = await axiosInstance.request(config);
      return { data: result.data };
    } catch (err) {
      const e = err as AxiosError;
      return { error: { status: e.response?.status, message: getErrorMessage(err), data: e.response?.data } };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User', 'Product', 'Category', 'Cart', 'Order', 'Review', 'Wishlist', 'Address', 'Admin'],
  endpoints: () => ({}),
});
