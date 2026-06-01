import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

export const CartEmpty: React.FC = () => {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
      <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex">
        Continue Shopping
      </Link>
    </div>
  );
};