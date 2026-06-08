import React from 'react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Insights</span>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mt-2">Analytics</h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">Detailed analytics and reporting.</p>
      </div>
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-sm)]">
        <p className="font-display text-xl text-[var(--color-text-primary)]">Analytics Dashboard</p>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-2">Charts and reports will be rendered here.</p>
      </div>
    </div>
  );
};