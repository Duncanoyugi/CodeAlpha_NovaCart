import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, cn } from '../../../components/ui';

export const PageTitle: React.FC<{ eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }> = ({ eyebrow = 'Management', title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-extrabold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatCard: React.FC<{ label: string; value: string; hint?: React.ReactNode; icon: React.ReactNode; tone?: 'brand' | 'accent' | 'info' | 'danger' }> = ({ label, value, hint, icon, tone = 'brand' }) => {
  const tones = { brand: 'bg-brand-50 text-brand-700', accent: 'bg-accent-100 text-accent-600', info: 'bg-sky-50 text-sky-700', danger: 'bg-red-50 text-red-600' };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-ink-500">{label}</p><span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}>{icon}</span></div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
};

export const TableShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft"><table className="w-full min-w-[720px] text-left text-sm">{children}</table></div>
);
export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...p }) => <th className={cn('whitespace-nowrap bg-ink-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-500', className)} {...p} />;
export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...p }) => <td className={cn('border-t border-ink-100 px-4 py-3.5 align-middle', className)} {...p} />;

export const Pager: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void }> = ({ page, totalPages, onChange }) =>
  totalPages <= 1 ? null : (
    <div className="mt-5 flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
      <span className="text-sm text-ink-500">Page {page} of {totalPages}</span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>Next</Button>
    </div>
  );

export const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => { const t = window.setTimeout(() => onChange(local), 350); return () => window.clearTimeout(t); }, [local, onChange]);
  return <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100" />;
};
