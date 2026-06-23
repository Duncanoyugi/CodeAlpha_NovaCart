import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, type = 'text', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-body font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-all duration-150 placeholder:text-[var(--color-text-muted)] placeholder:opacity-60 focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-raised)] focus:shadow-[0_0_0_4px_rgba(15,110,81,0.1)] focus:outline-none ${
              icon ? 'pl-11' : ''
            } ${
              error ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/5 focus:shadow-[0_0_0_4px_rgba(194,69,45,0.1)]' : ''
            } ${className}`}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <p className={`mt-1.5 text-xs font-body ${error ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
