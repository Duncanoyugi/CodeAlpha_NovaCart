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
    onChange?.(tabId);
  };

  const activeTabContent = items.find((item) => item.id === activeTabId)?.content;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-[var(--color-border)]">
        <nav className="flex space-x-8" aria-label="Tabs">
          {items.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-medium)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="transition-all duration-300">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;
