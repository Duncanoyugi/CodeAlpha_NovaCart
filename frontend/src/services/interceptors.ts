import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { axiosInstance, API_BASE_URL } from './axios';
import { tokenService } from './tokenService';
import { sessionService } from './session';
import { API_ENDPOINTS } from '../utils/constants';

type Retriable = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshing: Promise<string> | null = null;
let onSessionExpired: (() => void) | null = null;

/** Registered once at startup so axios can tell Redux the session is gone. */
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

const AUTH_URLS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.VERIFY_OTP,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
];

/** One shared refresh request, no matter how many calls hit 401 at once. */
const refreshAccessToken = (): Promise<string> => {
  if (!refreshing) {
    const refresh = tokenService.getRefreshToken();
    if (!refresh) return Promise.reject(new Error('No refresh token'));
    // Plain axios: bypass our own interceptors to avoid loops.
    refreshing = axios
      .post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, { refresh }, { withCredentials: true })
      .then(({ data }) => {
        if (!data?.access) throw new Error('Refresh failed');
        // Refresh-token rotation: the server returns a NEW refresh token; the old one is dead.
        tokenService.setTokens(data.access, data.refresh || refresh);
        return data.access as string;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

export const setupInterceptors = () => {
  axiosInstance.interceptors.response.use(
    (response) => {
      const key = response.headers?.['x-session-key'];
      if (key) sessionService.set(String(key));
      return response;
    },
    async (error: AxiosError) => {
      const original = error.config as Retriable | undefined;
      const key = error.response?.headers?.['x-session-key'];
      if (key) sessionService.set(String(key));

      const isAuthCall = AUTH_URLS.some((url) => original?.url?.includes(url));
      if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
        original._retry = true;
        try {
          const access = await refreshAccessToken();
          original.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(original);
        } catch {
          tokenService.removeTokens();
          onSessionExpired?.();
        }
      }
      return Promise.reject(error);
    },
  );
};
