import { apiSlice } from '../../../redux/api/apiSlice';
import { API_ENDPOINTS } from '../../../utils/constants';
import type { Product, Category, ProductFilters, ProductListResponse } from '../../../types';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, ProductFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        return `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
      },
      providesTags: ['Product'],
    }),
    getProductBySlug: builder.query<Product, string>({
      query: (slug) => API_ENDPOINTS.PRODUCTS.DETAIL(slug),
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.CATEGORIES,
      providesTags: ['Category'],
    }),
    getFeaturedProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.FEATURED,
      providesTags: ['Product'],
    }),
    getBestSellingProducts: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.BEST_SELLING,
      providesTags: ['Product'],
    }),
    getNewArrivals: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.NEW_ARRIVALS,
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetBestSellingProductsQuery,
  useGetNewArrivalsQuery,
} = productApi;