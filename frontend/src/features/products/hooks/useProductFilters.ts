import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SORT_OPTIONS, PAGINATION } from '../../../utils/constants';

export const useProductFilters = (initial?: Record<string, any>) => {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: initial?.search ?? searchParams.get('search') ?? '',
    category: initial?.category ?? searchParams.get('category') ?? '',
    min_price: initial?.min_price ?? (searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined),
    max_price: initial?.max_price ?? (searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined),
    min_rating: initial?.min_rating ?? (searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined),
    sort_by: initial?.sort_by ?? searchParams.get('sort_by') ?? SORT_OPTIONS[0].value,
    page: (initial?.page ?? Number(searchParams.get('page'))) || PAGINATION.DEFAULT_PAGE,
    page_size: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSearchChange = useCallback((value: string) => setFilter('search', value), [setFilter]);
  const handleCategoryChange = useCallback((category: string) => setFilter('category', category), [setFilter]);
  const handlePriceChange = useCallback((min?: number, max?: number) => setFilter('min_price', min), [setFilter]);
  const handleRatingChange = useCallback((rating?: number) => setFilter('min_rating', rating), [setFilter]);
  const handleSortChange = useCallback((sort: string) => setFilter('sort_by', sort), [setFilter]);
  const handleAvailabilityChange = useCallback((inStock?: boolean) => {}, []);
  const handlePageChange = useCallback((page: number) => setFilter('page', page), [setFilter]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      min_price: undefined,
      max_price: undefined,
      min_rating: undefined,
      sort_by: SORT_OPTIONS[0].value,
      page: PAGINATION.DEFAULT_PAGE,
      page_size: PAGINATION.DEFAULT_PAGE_SIZE,
    });
  }, []);

  return {
    filters,
    sortOptions: SORT_OPTIONS,
    setFilters,
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
