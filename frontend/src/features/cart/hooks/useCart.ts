import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import type { AddToCartData } from '../../../types';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../../../redux/slices/cartSlice';
import { useCallback } from 'react';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, isLoading, isAddingToCart, isUpdatingCart, error } = useAppSelector(
    (state) => state.cart
  );

  const getCart = useCallback(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const addItemToCart = useCallback((data: AddToCartData) => {
    dispatch(addToCart(data));
  }, [dispatch]);

  const updateItemQuantity = useCallback((id: string, quantity: number) => {
    dispatch(updateCartItem({ id, quantity }));
  }, [dispatch]);

  const removeItemFromCart = useCallback((id: string) => {
    dispatch(removeFromCart(id));
  }, [dispatch]);

  const clearAllItems = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const getItemQuantity = (productId: string): number => {
    if (!cart?.items) return 0;
    const item = cart.items.find((item) => item.product.id === productId);
    return item?.quantity || 0;
  };

  const isInCart = (productId: string): boolean => {
    return getItemQuantity(productId) > 0;
  };

  return {
    cart,
    items: cart?.items || [],
    totalItems: cart?.total_items || 0,
    subtotal: cart?.subtotal || 0,
    shippingCost: cart?.shipping_cost || 0,
    taxAmount: cart?.tax_amount || 0,
    totalAmount: cart?.total_amount || 0,
    isLoading,
    isAddingToCart,
    isUpdatingCart,
    error,
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearAllItems,
    getItemQuantity,
    isInCart,
  };
};