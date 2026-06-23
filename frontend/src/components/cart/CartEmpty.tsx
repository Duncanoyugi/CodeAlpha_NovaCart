import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { Button } from '../common/Button';

export const CartEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="relative w-24 h-24 flex items-center justify-center bg-[var(--color-gold-50)] text-[var(--color-gold-500)] rounded-[var(--radius-2xl)] mb-8 shadow-sm">
        <ShoppingBag className="w-10 h-10" />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--color-gold-500)] rounded-full flex items-center justify-center shadow-md">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
      <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-3">Your cart is empty</h3>
      <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-8 max-w-sm leading-relaxed">
        Looks like you haven't added any items to your cart yet. Start exploring our collections and find something you love.
      </p>
      <Link to={ROUTES.PRODUCTS}>
        <Button variant="primary" size="lg" className="shadow-[var(--shadow-gold)]">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
};
