import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { Button } from '../common/Button';

export const CartEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 flex items-center justify-center bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)] rounded-[var(--radius-2xl)] mb-6">
        <ShoppingBag className="w-10 h-10" />
      </div>
      <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">Your cart is empty</h3>
      <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-8 max-w-sm">
        Looks like you haven't added any items to your cart yet. Start exploring our collections.
      </p>
      <Link to={ROUTES.PRODUCTS}>
        <Button variant="primary">Continue Shopping</Button>
      </Link>
    </div>
  );
};
