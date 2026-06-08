import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_rgba(212,165,116,0.15)] focus:outline-none ${
              icon ? 'pl-10' : ''
            } ${
              error ? 'border-[var(--color-danger-border)]' : ''
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs text-[var(--color-danger-text)]">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
