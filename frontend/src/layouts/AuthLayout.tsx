import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME}>
            <span className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
              Nova<span className="text-[var(--color-gold-400)]">Cart</span>
            </span>
          </Link>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-lg)] p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;