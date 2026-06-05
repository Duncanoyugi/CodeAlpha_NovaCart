import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  actionOnClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionUrl,
  actionOnClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-[32px] shadow-sm max-w-lg mx-auto ${className}`}>
      {/* Icon frame */}
      <div className="flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-slate-850 text-gray-400 dark:text-gray-505 rounded-[24px] mb-6 shadow-inner">
        {icon}
      </div>

      {/* Heading */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && (
        <>
          {actionUrl ? (
            <Link to={actionUrl}>
              <Button variant="primary">{actionLabel}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={actionOnClick}>
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;
