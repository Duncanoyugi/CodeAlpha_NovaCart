import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { axiosInstance } from '../../services/axios';
import { sessionService } from '../../services/session';
import { getErrorMessage } from '../../services/errorHandler';
import { API_ENDPOINTS } from '../../utils/constants';
import type { Cart, AddToCartData, UpdateCartData, CartState } from '../../types';

const initialState: CartState & { drawerOpen: boolean; pendingItemId: string | null } = {
  cart: null,
  isLoading: false,
  error: null,
  isAddingToCart: false,
  isUpdatingCart: false,
  drawerOpen: false,
  pendingItemId: null,
};

/** Every cart mutation returns the fresh cart, so the UI never needs a second round trip. */
const cartFrom = (data: { data?: Cart; cart?: Cart }): Cart | undefined => data.cart ?? data.data;

export const fetchCart = createAsyncThunk<Cart, void, { rejectValue: string }>('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(API_ENDPOINTS.CART.GET);
    if (data.data?.session_key && !localStorage.getItem('access_token')) sessionService.set(data.data.session_key);
    return data.data as Cart;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not load your cart'));
  }
});

export const addToCart = createAsyncThunk<Cart, AddToCartData, { rejectValue: string }>('cart/add', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(API_ENDPOINTS.CART.ADD, payload);
    toast.success('Added to your cart');
    return cartFrom(data) as Cart;
  } catch (error) {
    const message = getErrorMessage(error, 'Could not add this item');
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateCartItem = createAsyncThunk<Cart, UpdateCartData, { rejectValue: string }>('cart/update', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(API_ENDPOINTS.CART.UPDATE(id), { quantity });
    return cartFrom(data) as Cart;
  } catch (error) {
    const message = getErrorMessage(error, 'Could not update the quantity');
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const removeFromCart = createAsyncThunk<Cart, string, { rejectValue: string }>('cart/remove', async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete(API_ENDPOINTS.CART.REMOVE(id));
    return cartFrom(data) as Cart;
  } catch (error) {
    const message = getErrorMessage(error, 'Could not remove this item');
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const clearCart = createAsyncThunk<Cart, void, { rejectValue: string }>('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete(API_ENDPOINTS.CART.CLEAR);
    return cartFrom(data) as Cart;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not clear your cart'));
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    openCartDrawer: (state) => {
      state.drawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.drawerOpen = false;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state: typeof initialState, action: PayloadAction<Cart>) => {
      if (action.payload) state.cart = action.payload;
    };
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = !state.cart;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        setCart(state, action);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Could not load your cart';
      })
      .addCase(addToCart.pending, (state) => {
        state.isAddingToCart = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isAddingToCart = false;
        setCart(state, action);
      })
      .addCase(addToCart.rejected, (state) => {
        state.isAddingToCart = false;
      })
      .addCase(updateCartItem.pending, (state, action) => {
        state.isUpdatingCart = true;
        state.pendingItemId = action.meta.arg.id;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isUpdatingCart = false;
        state.pendingItemId = null;
        setCart(state, action);
      })
      .addCase(updateCartItem.rejected, (state) => {
        state.isUpdatingCart = false;
        state.pendingItemId = null;
      })
      .addCase(removeFromCart.pending, (state, action) => {
        state.isUpdatingCart = true;
        state.pendingItemId = action.meta.arg;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isUpdatingCart = false;
        state.pendingItemId = null;
        setCart(state, action);
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.isUpdatingCart = false;
        state.pendingItemId = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => setCart(state, action));
  },
});

export const { clearCartState, clearError, openCartDrawer, closeCartDrawer } = cartSlice.actions;
export default cartSlice.reducer;
