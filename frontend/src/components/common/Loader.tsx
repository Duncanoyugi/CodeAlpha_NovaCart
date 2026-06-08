import React from 'react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullPage = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-t-[var(--color-gold-400)] border-r-transparent border-b-[var(--color-gold-200)] border-l-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-base)]/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export default Loader;
