import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
} from '../../../redux/slices/wishlistSlice';

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { items, totalItems, isLoading, error } = useAppSelector((state) => state.wishlist);

  const getWishlist = () => {
    dispatch(fetchWishlist());
  };

  const addItem = (productId: string) => {
    dispatch(addToWishlist(productId));
  };

  const removeItem = (productId: string) => {
    dispatch(removeFromWishlist(productId));
  };

  const checkItem = (productId: string) => {
    dispatch(checkInWishlist(productId));
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.product.id === productId);
  };

  return {
    items,
    totalItems,
    isLoading,
    error,
    getWishlist,
    addItem,
    removeItem,
    checkItem,
    isInWishlist,
  };
};