import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetCategoryBySlugQuery } from '../../../redux/api/storeApi';
import { ProductListing } from '../components/ProductListing';
import { EmptyState } from '../../../components/ui';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug = '' } = useParams();
  const { data, isError, isLoading } = useGetCategoryBySlugQuery(slug);

  if (isError) {
    return <EmptyState icon={<Compass className="h-9 w-9" />} title="Category not found" description="That category doesn’t exist or is no longer available." action={<Link to="/products" className="font-semibold text-brand-700 hover:underline">Browse all products</Link>} />;
  }
  return <ProductListing key={slug} categorySlug={slug} title={isLoading ? 'Loading…' : data?.category.name ?? 'Category'} subtitle={data?.category.description} />;
};

export default CategoryPage;
