import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import reducers (will add as we create them)
// import authReducer from './slices/authSlice';
// import cartReducer from './slices/cartSlice';
// import wishlistReducer from './slices/wishlistSlice';
// import uiReducer from './slices/uiSlice';
// import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // cart: cartReducer,
    // wishlist: wishlistReducer,
    // ui: uiReducer,
    // [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
    // .concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;