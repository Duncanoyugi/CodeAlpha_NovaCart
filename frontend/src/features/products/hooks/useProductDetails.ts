import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { fetchProductBySlug, clearCurrentProduct } from '../../../redux/slices/productSlice';

export const useProductDetails = () => {
  const dispatch = useAppDispatch();
  const { currentProduct, isLoading, error } = useAppSelector((state) => state.products);

  const getProduct = (slug: string) => {
    dispatch(fetchProductBySlug(slug));
  };

  const clearProduct = () => {
    dispatch(clearCurrentProduct());
  };

  return {
    product: currentProduct,
    isLoading,
    error,
    getProduct,
    clearProduct,
  };
};