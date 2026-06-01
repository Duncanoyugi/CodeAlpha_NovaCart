import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ROUTES } from '../utils/constants';

export const NotFoundPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link to={ROUTES.HOME} className="btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;