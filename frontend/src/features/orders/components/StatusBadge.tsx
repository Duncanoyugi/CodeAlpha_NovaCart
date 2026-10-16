import React from 'react';
import { Badge } from '../../../components/ui';

const ORDER_TONE = { pending: 'warning', processing: 'info', confirmed: 'info', shipped: 'brand', delivered: 'brand', cancelled: 'danger', refunded: 'neutral' } as const;
const ORDER_LABEL: Record<string, string> = { pending: 'Awaiting payment', processing: 'Processing', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };
const PAY_TONE = { pending: 'warning', paid: 'brand', failed: 'danger', refunded: 'neutral' } as const;
const PAY_LABEL: Record<string, string> = { pending: 'Unpaid', paid: 'Paid', failed: 'Payment failed', refunded: 'Refunded' };

export const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge tone={ORDER_TONE[status as keyof typeof ORDER_TONE] ?? 'neutral'}>{ORDER_LABEL[status] ?? status}</Badge>
);
export const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge tone={PAY_TONE[status as keyof typeof PAY_TONE] ?? 'neutral'}>{PAY_LABEL[status] ?? status}</Badge>
);
