import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import type { AddToCartData } from '../../../types';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
} from '../../../redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, isLoading, isAddingToCart, isUpdatingCart, error, drawerOpen, pendingItemId } = useAppSelector(
    (state) => state.cart,
  );

  const getCart = useCallback(() => dispatch(fetchCart()), [dispatch]);
  const addItemToCart = useCallback(
    async (data: AddToCartData, options: { openDrawer?: boolean } = {}) => {
      const result = await dispatch(addToCart(data));
      if (addToCart.fulfilled.match(result) && options.openDrawer !== false) dispatch(openCartDrawer());
      return addToCart.fulfilled.match(result);
    },
    [dispatch],
  );
  const updateItemQuantity = useCallback((id: string, quantity: number) => dispatch(updateCartItem({ id, quantity })), [dispatch]);
  const removeItemFromCart = useCallback((id: string) => dispatch(removeFromCart(id)), [dispatch]);
  const clearAllItems = useCallback(() => dispatch(clearCart()), [dispatch]);
  const openDrawer = useCallback(() => dispatch(openCartDrawer()), [dispatch]);
  const closeDrawer = useCallback(() => dispatch(closeCartDrawer()), [dispatch]);

  const getItemQuantity = (productId: string): number =>
    cart?.items.filter((item) => item.product.id === productId).reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    items: cart?.items ?? [],
    totalItems: cart?.total_items ?? 0,
    subtotal: cart?.subtotal ?? 0,
    shippingCost: cart?.shipping_cost ?? 0,
    taxAmount: cart?.tax_amount ?? 0,
    totalAmount: cart?.total_amount ?? 0,
    freeShippingThreshold: cart?.free_shipping_threshold ?? 5000,
    isLoading,
    isAddingToCart,
    isUpdatingCart,
    pendingItemId,
    drawerOpen,
    error,
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearAllItems,
    openDrawer,
    closeDrawer,
    getItemQuantity,
    isInCart: (productId: string) => getItemQuantity(productId) > 0,
  };
};
