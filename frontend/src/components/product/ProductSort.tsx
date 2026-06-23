import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

export const ProductSort: React.FC<{ options: readonly { value: string; label: string }[]; value: string; onChange: (value: string) => void }> = ({ options, value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none font-ui text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] border border-[var(--color-border-medium)] rounded-[var(--radius-lg)] pl-3 pr-10 py-2.5 cursor-pointer focus:border-[var(--color-border-focus)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(196,145,92,0.12)] transition-all"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
    </div>
  );
};
