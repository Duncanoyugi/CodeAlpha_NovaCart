import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-8">
          <span className="font-display text-[120px] md:text-[160px] font-bold text-[var(--color-text-primary)]/5 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-[var(--color-text-muted)]/30" />
          </div>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-3">Page Not Found</h2>
        <p className="font-body text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={ROUTES.HOME}>
            <Button variant="primary" className="shadow-md">
              <Home className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </Link>
          <Link to={ROUTES.PRODUCTS}>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;