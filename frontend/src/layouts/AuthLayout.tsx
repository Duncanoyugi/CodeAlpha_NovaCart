import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { ShoppingBag, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--color-bg-inverse)] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 30% 20%, var(--color-primary) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, var(--color-primary) 0%, transparent 60%)'}} />
        </div>
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] mb-8 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl text-[var(--color-text-inverse)] mb-4 leading-tight">
            Welcome to <span className="text-[var(--color-primary)]">NovaCart</span>
          </h1>
          <p className="text-[var(--color-text-inverse)]/70 text-lg leading-relaxed mb-8">
            Discover a world of curated products. Quality meets elegance in every item we offer.
          </p>
          <div className="flex items-center justify-center gap-6 text-[var(--color-primary)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-body text-[var(--color-text-inverse)]/60">Premium Quality</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-body text-[var(--color-text-inverse)]/60">Free Shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to={ROUTES.HOME} className="inline-flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-primary)]">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                Nova<span className="text-[var(--color-primary)]">Cart</span>
              </span>
            </Link>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] p-8 sm:p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;