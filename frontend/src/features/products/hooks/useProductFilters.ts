import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from './useProducts';
import { SORT_OPTIONS } from '../../../utils/constants';

export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateFilters, getProducts } = useProducts();
  
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
    in_stock: searchParams.get('in_stock') === 'true' ? true : undefined,
    sort_by: searchParams.get('sort_by') || '-created_at',
    page: Number(searchParams.get('page')) || 1,
  });

  // Sync URL params with filters
  useEffect(() => {
    const params: Record<string, string> = {};
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 1) {
        params[key] = String(value);
      }
    });
    setSearchParams(params);
  }, [localFilters, setSearchParams]);

  // Apply filters and fetch products
  const applyFilters = useCallback(() => {
    updateFilters(localFilters);
    getProducts();
  }, [localFilters, updateFilters, getProducts]);

  // Handle search input change with debounce
  const handleSearchChange = useCallback((value: string) => {
    setLocalFilters(prev => ({ ...prev, search: value, page: 1 }));
  }, []);

  // Handle price range change
  const handlePriceChange = useCallback((min?: number, max?: number) => {
    setLocalFilters(prev => ({ ...prev, min_price: min, max_price: max, page: 1 }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    setLocalFilters(prev => ({ ...prev, sort_by: value, page: 1 }));
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string) => {
    setLocalFilters(prev => ({ ...prev, category: categoryId, page: 1 }));
  }, []);

  // Handle rating change
  const handleRatingChange = useCallback((rating?: number) => {
    setLocalFilters(prev => ({ ...prev, min_rating: rating, page: 1 }));
  }, []);

  // Handle availability change
  const handleAvailabilityChange = useCallback((inStock?: boolean) => {
    setLocalFilters(prev => ({ ...prev, in_stock: inStock, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setLocalFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setLocalFilters({
      search: '',
      category: '',
      min_price: undefined,
      max_price: undefined,
      min_rating: undefined,
      in_stock: undefined,
      sort_by: '-created_at',
      page: 1,
    });
  }, []);

  return {
    filters: localFilters,
    sortOptions: SORT_OPTIONS,
    applyFilters,
    handleSearchChange,
    handlePriceChange,
    handleSortChange,
    handleCategoryChange,
    handleRatingChange,
    handleAvailabilityChange,
    handlePageChange,
    clearAllFilters,
  };
};