import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortProps {
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

export const ProductSort: React.FC<ProductSortProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <ArrowUpDown className="w-4 h-4 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-none bg-transparent text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};