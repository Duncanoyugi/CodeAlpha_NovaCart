import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export const ProductSort: React.FC<{ options: readonly { value: string; label: string }[]; value: string; onChange: (value: string) => void }> = ({ options, value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="font-ui text-sm text-[var(--color-text-primary)] bg-transparent border-none focus:ring-0 cursor-pointer">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};
