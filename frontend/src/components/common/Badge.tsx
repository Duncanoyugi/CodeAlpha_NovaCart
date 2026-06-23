import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  ...props
}) => {
  const styles = {
    success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20',
    warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20',
    danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20',
    info: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
    default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
    primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-body font-semibold tracking-[0.03em] uppercase ${styles[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
