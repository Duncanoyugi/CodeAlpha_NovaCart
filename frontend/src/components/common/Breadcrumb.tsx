import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <li className="inline-flex items-center">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 hover:text-[#ff902b] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              {item.url && !isLast ? (
                <Link
                  to={item.url}
                  className="hover:text-[#ff902b] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700 dark:text-gray-200 font-semibold truncate max-w-[200px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
