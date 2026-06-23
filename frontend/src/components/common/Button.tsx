import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-body font-semibold rounded-[var(--radius-lg)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap select-none';

  const variants = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:brightness-110 focus-visible:ring-[var(--color-accent)] shadow-sm hover:shadow-md',
    secondary: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:brightness-110 focus-visible:ring-[var(--color-primary)] shadow-sm hover:shadow-md',
    outline: 'bg-transparent border-2 border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:ring-[var(--color-primary)]',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] focus-visible:ring-[var(--color-border)]',
    destructive: 'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:brightness-110 focus-visible:ring-[var(--color-danger)] shadow-sm',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-7 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent shrink-0" />
      )}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
