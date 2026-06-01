import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { fetchProducts, setFilters, resetFilters } from '../../../redux/slices/productSlice';
import type { ProductFilters } from '../../../types';

export const useProducts = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading, error, pagination, filters } = useAppSelector((state) => state.products);

  const getProducts = (customFilters?: Partial<ProductFilters>) => {
    const mergedFilters = { ...filters, ...customFilters };
    dispatch(fetchProducts(mergedFilters));
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    dispatch(setFilters(newFilters));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  return {
    products,
    isLoading,
    error,
    pagination,
    filters,
    getProducts,
    updateFilters,
    clearFilters,
  };
};