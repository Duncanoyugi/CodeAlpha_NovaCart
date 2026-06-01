import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="container-custom py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME}>
            <h1 className="text-3xl font-bold text-primary-600">NovaCart</h1>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};