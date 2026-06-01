import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/axios';
import { API_ENDPOINTS } from '../../utils/constants';
import type { WishlistItem, WishlistState } from '../../types';
import toast from 'react-hot-toast';

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.WISHLIST.GET);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.WISHLIST.ADD, { product_id: productId });
      toast.success('Added to wishlist');
      dispatch(fetchWishlist()); // Refresh wishlist
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
      toast.success('Removed from wishlist');
      dispatch(fetchWishlist()); // Refresh wishlist
      return productId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const checkInWishlist = createAsyncThunk(
  'wishlist/checkInWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.WISHLIST.CHECK(productId));
      return { productId, inWishlist: response.data.data.in_wishlist };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<{ items: WishlistItem[]; total_items: number }>) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalItems = action.payload.total_items;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist, clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;