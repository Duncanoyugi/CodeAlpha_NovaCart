import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';

export const WishlistEmpty: React.FC = () => (
  <div className="rounded-[var(--radius-2xl)] border-2 border-dashed border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] p-16 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-gold-50)] text-[var(--color-gold-500)] mb-6 shadow-sm">
      <Heart className="h-9 w-9" fill="currentColor" />
    </div>
    <h2 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2">Your wishlist is empty</h2>
    <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-8 max-w-sm mx-auto">Save products you love and pick up where you left off later.</p>
    <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex items-center gap-2 shadow-[var(--shadow-gold)]">
      <Sparkles className="w-4 h-4" />
      Browse Products
    </Link>
  </div>
);