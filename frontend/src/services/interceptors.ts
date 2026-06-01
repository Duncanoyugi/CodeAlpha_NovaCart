import { axiosInstance } from './axios';
import { tokenService } from './tokenService';
import { API_ENDPOINTS } from '../utils/constants';
import toast from 'react-hot-toast';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = () => {
  // Response interceptor for token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = tokenService.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, {
            refresh: refreshToken,
          });

          if (response.data.success) {
            const { access } = response.data;
            tokenService.setTokens(access, refreshToken);
            
            processQueue(null, access);
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return axiosInstance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          tokenService.removeTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Show error toast for non-auth errors
      const message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';
      if (error.response?.status !== 401) {
        toast.error(message);
      }

      return Promise.reject(error);
    }
  );
};