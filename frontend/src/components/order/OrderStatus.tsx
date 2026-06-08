import React from 'react';

const statusStyles: Record<string, string> = {
  pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]',
  processing: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]',
  confirmed: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]',
  shipped: 'bg-[#EFF8FF] text-[#1E6FA8] border-[#B3D9F5]',
  delivered: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]',
  cancelled: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]',
  refunded: 'bg-[#F5F0FF] text-[#5B21B6] border-[#C4B5FD]',
};

export const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full font-ui text-[11px] font-medium tracking-wider ${statusStyles[status] || statusStyles.pending}`}>
    {status.toUpperCase()}
  </span>
);
