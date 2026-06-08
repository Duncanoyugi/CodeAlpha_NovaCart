import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary: 'bg-[var(--color-gold-400)] text-[var(--color-gold-800)] hover:bg-[var(--color-gold-200)] focus:ring-[var(--color-gold-400)]',
    secondary: 'bg-transparent text-[var(--color-text-accent)] border border-[var(--color-gold-400)] hover:bg-[var(--color-gold-50)] focus:ring-[var(--color-gold-400)]',
    outline: 'bg-transparent border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] focus:ring-[var(--color-border-focus)]',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] focus:ring-[var(--color-border-medium)]',
    danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)] hover:bg-[var(--color-danger-text)] hover:text-white focus:ring-[var(--color-danger-border)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
};

export default Button;
