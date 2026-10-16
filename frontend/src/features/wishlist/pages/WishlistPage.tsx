import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useGetWishlistQuery } from '../../../redux/api/storeApi';
import { ProductCard, ProductGridSkeleton } from '../../../components/product/ProductCard';
import { AccountShell } from '../../profile/components/AccountShell';
import { Button, EmptyState, ErrorState } from '../../../components/ui';
import { ROUTES } from '../../../utils/constants';

export const WishlistPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetWishlistQuery();
  return (
    <AccountShell title="My wishlist" subtitle={data ? `${data.total_items} saved item${data.total_items === 1 ? '' : 's'}` : undefined}>
      {isError ? <ErrorState onRetry={refetch} /> : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3"><ProductGridSkeleton count={3} /></div>
      ) : !data?.items.length ? (
        <EmptyState icon={<Heart className="h-9 w-9" />} title="Nothing saved yet" description="Tap the heart on any product to keep it here for later." action={<Link to={ROUTES.PRODUCTS}><Button>Browse products</Button></Link>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">{data.items.map((i) => <ProductCard key={i.id} product={i.product_details} />)}</div>
      )}
    </AccountShell>
  );
};

export default WishlistPage;
