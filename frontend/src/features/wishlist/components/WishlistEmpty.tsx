import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';

export const WishlistEmpty: React.FC = () => (
  <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-600">
      <Heart className="h-8 w-8" />
    </div>
    <h2 className="mt-6 text-2xl font-semibold text-gray-900">Your wishlist is empty</h2>
    <p className="mt-2 text-gray-500">Save products you love and pickup where you left off.</p>
    <Link to={ROUTES.PRODUCTS} className="btn-primary mt-6 inline-flex">
      Browse Products
    </Link>
  </div>
);