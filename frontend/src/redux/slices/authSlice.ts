import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/axios';
import { tokenService } from '../../services/tokenService';
import { API_ENDPOINTS } from '../../utils/constants';
import type { AuthState, User, LoginCredentials, RegisterData, VerifyOTPData, AuthResponse } from '../../types';
import toast from 'react-hot-toast';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData: VerifyOTPData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, otpData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'OTP verification failed';
      return rejectWithValue(message);
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to resend OTP';
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (refreshToken) {
        await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh: refreshToken });
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

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
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      tokenService.removeTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        tokenService.setTokens(action.payload.tokens.access, action.payload.tokens.refresh);
        toast.success('Login successful! Welcome back.');
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Registration successful! Please check your email for OTP.');
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        tokenService.setTokens(action.payload.tokens.access, action.payload.tokens.refresh);
        toast.success('Email verified successfully! Welcome to NovaCart!');
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      
      // Resend OTP
      .addCase(resendOTP.fulfilled, () => {
        toast.success('OTP resent successfully!');
      })
      .addCase(resendOTP.rejected, (_state, action) => {
        toast.error(action.payload as string);
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        tokenService.removeTokens();
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        tokenService.removeTokens();
        toast.success('Logged out successfully');
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        tokenService.removeTokens();
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;