import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const styles = {
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]',
    danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]',
    info: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]',
    default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
