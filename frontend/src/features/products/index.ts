// Pages
export { ProductsPage } from './pages/ProductPage';
export { ProductDetailsPage } from './pages/ProductDetailsPage';
export { CategoryPage } from './pages/CategoryPage';

// Components
export { ProductCard } from '../../components/product/ProductCard';
export { ProductGrid } from '../../components/product/ProductGrid';
export { ProductFilters } from '../../components/product/ProductFilters';
export { ProductSort } from '../../components/product/ProductSort';

// Hooks
export { useProducts } from './hooks/useProducts';
export { useProductDetails } from './hooks/useProductDetails';
export { useProductFilters } from './hooks/useProductFilters';

// API
export { productApi, useGetProductsQuery, useGetProductBySlugQuery } from './api/productApi';