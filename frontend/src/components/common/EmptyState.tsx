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
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] max-w-lg mx-auto ${className}`}>
      <div className="flex items-center justify-center w-20 h-20 bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] rounded-[var(--radius-2xl)] mb-6">
        {icon}
      </div>

      <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

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
