import React from 'react';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* ---------------------------------------------------------------- Button */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const buttonVariants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm hover:shadow-brand active:scale-[0.98]',
  accent: 'bg-accent-400 text-ink-900 hover:bg-accent-500 shadow-sm active:scale-[0.98]',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
  outline: 'border border-ink-200 bg-white text-ink-800 hover:border-brand-600 hover:text-brand-700',
  ghost: 'text-ink-700 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
const buttonSizes = { sm: 'h-9 px-3.5 text-sm gap-1.5', md: 'h-11 px-5 text-sm gap-2', lg: 'h-12 px-7 text-base gap-2.5' };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, block, leftIcon, rightIcon, className, children, disabled, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-xl font-semibold transition-all duration-150 disabled:opacity-55 disabled:shadow-none disabled:active:scale-100',
        buttonVariants[variant],
        buttonSizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  ),
);
Button.displayName = 'Button';

/* ----------------------------------------------------------------- Inputs */
type FieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, error, hint, leftIcon, className, id, ...rest }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-err` : undefined}
            className={cn(
              'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-4',
              !!leftIcon && 'pl-10',
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-200 hover:border-ink-300 focus:border-brand-600 focus:ring-brand-100',
              className,
            )}
            {...rest}
          />
        </div>
        {error ? (
          <p id={`${inputId}-err`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        ) : (
          hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ label, error, className, id, children, ...rest }, ref) => {
    const autoId = React.useId();
    const selectId = id ?? autoId;
    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink-900 transition focus:outline-none focus:ring-4',
            error ? 'border-red-400 focus:ring-red-100' : 'border-ink-200 hover:border-ink-300 focus:border-brand-600 focus:ring-brand-100',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const autoId = React.useId();
    const areaId = id ?? autoId;
    return (
      <div className="w-full">
        {label && <label htmlFor={areaId} className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</label>}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            'min-h-24 w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-4',
            error ? 'border-red-400 focus:ring-red-100' : 'border-ink-200 hover:border-ink-300 focus:border-brand-600 focus:ring-brand-100',
            className,
          )}
          {...rest}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

/* ------------------------------------------------------------------ Badge */
const badgeTones = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-800',
  accent: 'bg-accent-100 text-accent-600',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  warning: 'bg-amber-100 text-amber-700',
  dark: 'bg-ink-900 text-white',
};
export const Badge: React.FC<{ tone?: keyof typeof badgeTones; className?: string; children: React.ReactNode }> = ({ tone = 'neutral', className, children }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeTones[tone], className)}>{children}</span>
);

/* --------------------------------------------------------------- Skeleton */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => <div className={cn('skeleton', className)} aria-hidden />;

/* ------------------------------------------------------------ Loaders etc. */
export const Spinner: React.FC<{ className?: string }> = ({ className }) => <Loader2 className={cn('h-5 w-5 animate-spin text-brand-700', className)} aria-label="Loading" />;

export const FullPageLoader: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 font-display text-2xl font-extrabold text-white shadow-brand">N</div>
    <Spinner />
  </div>
);

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">{icon}</div>
    <h2 className="text-xl font-bold">{title}</h2>
    {description && <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = 'Something went wrong while loading this page.', onRetry }) => (
  <EmptyState
    icon={<AlertCircle className="h-9 w-9" />}
    title="We hit a snag"
    description={message}
    action={onRetry && <Button onClick={onRetry}>Try again</Button>}
  />
);

/* ------------------------------------------------------------------- Card */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div className={cn('rounded-2xl border border-ink-100 bg-white shadow-soft', className)} {...rest} />
);

/* ------------------------------------------------------------------ Modal */
export const Modal: React.FC<{ open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }> = ({ open, onClose, title, children, size = 'md' }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn('relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl', width)}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title && <h2 className="text-lg font-bold">{title}</h2>}
              <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------- Rating etc. */
export const Stars: React.FC<{ value: number; size?: number; className?: string }> = ({ value, size = 14, className }) => (
  <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => {
      const fill = Math.max(0, Math.min(1, value - (i - 1)));
      return (
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <svg viewBox="0 0 20 20" width={size} height={size} className="absolute inset-0 text-ink-200" fill="currentColor"><path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z" /></svg>
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <svg viewBox="0 0 20 20" width={size} height={size} className="text-accent-400" fill="currentColor"><path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z" /></svg>
          </span>
        </span>
      );
    })}
  </span>
);

export const QuantityStepper: React.FC<{ value: number; min?: number; max?: number; onChange: (n: number) => void; disabled?: boolean; size?: 'sm' | 'md' }> = ({ value, min = 1, max = 99, onChange, disabled, size = 'md' }) => {
  const h = size === 'sm' ? 'h-9' : 'h-11';
  return (
    <div className={cn('inline-flex items-center rounded-xl border border-ink-200 bg-white', h, disabled && 'opacity-60')}>
      <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} className="h-full w-9 text-lg text-ink-600 hover:text-brand-700 disabled:text-ink-300">−</button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} className="h-full w-9 text-lg text-ink-600 hover:text-brand-700 disabled:text-ink-300">+</button>
    </div>
  );
};

export const Steps: React.FC<{ steps: string[]; current: number }> = ({ steps, current }) => (
  <ol className="flex items-center justify-center gap-2 sm:gap-4" aria-label="Progress">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li key={label} className="flex items-center gap-2 sm:gap-4">
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition', done && 'bg-brand-700 text-white', active && 'bg-brand-700 text-white ring-4 ring-brand-100', !done && !active && 'bg-ink-100 text-ink-500')}>
            {done ? <Check className="h-4 w-4" /> : i + 1}
          </span>
          <span className={cn('hidden text-sm font-semibold sm:block', active ? 'text-ink-900' : 'text-ink-500')}>{label}</span>
          {i < steps.length - 1 && <span className={cn('h-0.5 w-6 sm:w-12', done ? 'bg-brand-700' : 'bg-ink-200')} />}
        </li>
      );
    })}
  </ol>
);

export const SectionHeading: React.FC<{ eyebrow?: string; title: string; action?: React.ReactNode }> = ({ eyebrow, title, action }) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>}
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
    </div>
    {action}
  </div>
);
