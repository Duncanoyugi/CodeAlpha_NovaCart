import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTabId,
  onChange,
  className = '',
}) => {
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || (items.length > 0 ? items[0].id : '')
  );

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabContent = items.find((item) => item.id === activeTabId)?.content;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs Header */}
      <div className="border-b border-gray-200 dark:border-slate-800">
        <nav className="flex space-x-8" aria-label="Tabs">
          {items.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 focus:outline-none whitespace-nowrap ${
                  isActive
                    ? 'border-[#2b2350] dark:border-indigo-400 text-[#2b2350] dark:text-indigo-450'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tabs Content */}
      <div className="transition-all duration-300">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;
