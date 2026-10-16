import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../../../components/ui';

export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>((props, ref) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input ref={ref} {...props} type={show ? 'text' : 'password'} className="pr-11" />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className={`absolute right-3 ${props.label ? 'top-[2.35rem]' : 'top-1/2 -translate-y-1/2'} text-ink-400 hover:text-ink-700`}>
        {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const AuthHeading: React.FC<{ title: string; subtitle?: React.ReactNode }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-extrabold">{title}</h1>
    {subtitle && <p className="mt-2 text-sm text-ink-500">{subtitle}</p>}
  </div>
);

export const FormAlert: React.FC<{ message?: string | null; tone?: 'error' | 'info' }> = ({ message, tone = 'error' }) =>
  message ? (
    <div role="alert" className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-brand-50 text-brand-800'}`}>{message}</div>
  ) : null;

/** Password rules mirror the server's validators so users aren't surprised after submitting. */
export const passwordHints = (value: string) => [
  { ok: value.length >= 8, label: 'At least 8 characters' },
  { ok: /[A-Za-z]/.test(value) && /\d/.test(value), label: 'Letters and numbers' },
];

export const PasswordChecklist: React.FC<{ value: string }> = ({ value }) => (
  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    {passwordHints(value).map((h) => (
      <li key={h.label} className={h.ok ? 'font-semibold text-brand-700' : 'text-ink-400'}>{h.ok ? '✓' : '•'} {h.label}</li>
    ))}
  </ul>
);
