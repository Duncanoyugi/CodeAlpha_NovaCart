import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordationProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

export const Accordation: React.FC<AccordationProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-shadow hover:shadow-xs"
          >
            {/* Header Trigger */}
            <button
              type="button"
              onClick={() => handleToggle(item.id)}
              className="w-full flex items-center justify-between px-6 py-4 font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors text-left focus:outline-none"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {/* Expandable Content Container */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isOpen ? 'max-h-[1000px] opacity-100 border-t border-gray-100 dark:border-slate-800' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 py-5 text-sm text-gray-600 dark:text-gray-450 leading-relaxed bg-gray-50/50 dark:bg-slate-900/50">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordation;
