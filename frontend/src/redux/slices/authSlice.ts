import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/axios';
import { tokenService } from '../../services/tokenService';
import { sessionService } from '../../services/session';
import { getErrorMessage, getFieldErrors, getErrorCode } from '../../services/errorHandler';
import { API_ENDPOINTS } from '../../utils/constants';
import type { AuthState, User, LoginCredentials, RegisterData, VerifyOTPData, AuthResponse } from '../../types';

export interface AuthRejection {
  message: string;
  fields: Record<string, string>;
  code?: string;
}

const reject = (error: unknown, fallback: string): AuthRejection => ({
  message: getErrorMessage(error, fallback),
  fields: getFieldErrors(error),
  code: getErrorCode(error),
});

type AuthSliceState = AuthState & { isInitializing: boolean };

// If tokens exist we must restore the session before deciding whether to show login.
const initialState: AuthSliceState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: tokenService.isAuthenticated(),
  error: null,
};

export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: AuthRejection }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return data.data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Login failed'));
    }
  },
);

export const googleLogin = createAsyncThunk<AuthResponse, string, { rejectValue: AuthRejection }>(
  'auth/googleLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, { token: idToken });
      return data.data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Google sign-in failed'));
    }
  },
);

export const register = createAsyncThunk<{ email: string; full_name: string; email_sent: boolean }, RegisterData, { rejectValue: AuthRejection }>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return data.data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Registration failed'));
    }
  },
);

export const verifyOTP = createAsyncThunk<AuthResponse, VerifyOTPData, { rejectValue: AuthRejection }>(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, otpData);
      return data.data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Verification failed'));
    }
  },
);

export const resendOTP = createAsyncThunk<string, string, { rejectValue: AuthRejection }>(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
      return data.message as string;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not resend the code'));
    }
  },
);

export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: AuthRejection }>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      return data.data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Session expired'));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  const refresh = tokenService.getRefreshToken();
  try {
    if (refresh) await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh });
  } catch {
    /* logging out locally is what matters */
  }
  return null;
});

const startSession = (state: AuthSliceState, payload: AuthResponse) => {
  state.isLoading = false;
  state.user = payload.user;
  state.isAuthenticated = true;
  state.isInitializing = false;
  state.error = null;
  tokenService.setTokens(payload.tokens.access, payload.tokens.refresh);
};

const endSession = (state: AuthSliceState) => {
  state.user = null;
  state.isAuthenticated = false;
  state.isLoading = false;
  state.isInitializing = false;
  tokenService.removeTokens();
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    clearAuth: (state) => {
      endSession(state);
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => startSession(state, payload))
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message ?? 'Login failed';
      })

      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, { payload }) => startSession(state, payload))
      .addCase(googleLogin.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message ?? 'Google sign-in failed';
      })

      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message ?? 'Registration failed';
      })

      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, { payload }) => startSession(state, payload))
      .addCase(verifyOTP.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message ?? 'Verification failed';
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isInitializing = false;
        state.user = { ...(state.user ?? {}), ...payload } as User;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => endSession(state))

      .addCase(logout.fulfilled, (state) => {
        endSession(state);
        state.error = null;
        sessionService.clear();
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
