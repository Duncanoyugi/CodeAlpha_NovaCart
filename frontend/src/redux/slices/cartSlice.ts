import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/axios';
import { API_ENDPOINTS } from '../../utils/constants';
import type { Cart, AddToCartData, UpdateCartData, CartState } from '../../types';
import toast from 'react-hot-toast';

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  isAddingToCart: false,
  isUpdatingCart: false,
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CART.GET);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: AddToCartData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CART.ADD, data);
      toast.success('Item added to cart');
      dispatch(fetchCart()); // Refresh cart after adding
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, quantity }: UpdateCartData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.CART.UPDATE(id), { quantity });
      dispatch(fetchCart()); // Refresh cart after update
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.CART.REMOVE(id));
      toast.success('Item removed from cart');
      dispatch(fetchCart()); // Refresh cart after removal
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.CART.CLEAR);
      toast.success('Cart cleared');
      dispatch(fetchCart()); // Refresh cart after clearing
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const mergeCart = createAsyncThunk(
  'cart/mergeCart',
  async (sessionKey: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CART.MERGE, { session_key: sessionKey });
      dispatch(fetchCart()); // Refresh cart after merge
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to merge cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isAddingToCart = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isAddingToCart = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isAddingToCart = false;
      })
      
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isUpdatingCart = true;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.isUpdatingCart = false;
      })
      .addCase(updateCartItem.rejected, (state) => {
        state.isUpdatingCart = false;
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isUpdatingCart = true;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.isUpdatingCart = false;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.isUpdatingCart = false;
      });
  },
});

export const { clearCartState, clearError } = cartSlice.actions;
export default cartSlice.reducer;