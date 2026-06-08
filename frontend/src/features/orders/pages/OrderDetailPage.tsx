import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderStatusBadge } from '../../../components/order/OrderStatus';
import { OrderItems } from '../../../components/order/OrderItems';
import { OrderSummary } from '../../../components/order/OrderSummary';
import { useGetOrderDetailQuery, useCancelOrderMutation } from '../api/orderApi';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrderDetailQuery(id || '', { skip: !id });
  const [cancelOrder] = useCancelOrderMutation();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelOrder({ orderId: id!, reason: 'Customer requested cancellation' }).unwrap();
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
    } catch (e) {
      // handled by toast
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="h-8 w-48 skeleton rounded mb-8" />
        <div className="space-y-4">
          <div className="h-64 skeleton rounded-[var(--radius-lg)]" />
          <div className="h-40 skeleton rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-4">Order Not Found</h1>
        <Link to={ROUTES.ORDERS} className="btn-primary inline-flex">View All Orders</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">Order Details</span>
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] mt-1">#{order.order_number}</h1>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">Placed on {new Date(order.placed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to={ROUTES.ORDERS} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline">← Back to Orders</Link>
      </div>

      {/* Status & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <OrderStatusBadge status={order.status} />
        {order.status === 'pending' && (
          <Button variant="danger" onClick={() => setShowCancelModal(true)} className="text-xs">
            Cancel Order
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 mb-8 shadow-[var(--shadow-sm)]">
        <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-4">Items</h2>
        <OrderItems order={order} />
      </div>

      {/* Summary */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
        <OrderSummary order={order} />
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] p-6 max-w-md w-full shadow-[var(--shadow-xl)] border border-[var(--color-border-light)]">
            <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">Cancel Order?</h3>
            <p className="font-ui text-sm text-[var(--color-text-secondary)] mb-6">This action cannot be undone. Are you sure you want to cancel order #{order.order_number}?</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">Keep Order</Button>
              <Button variant="danger" onClick={handleCancel} className="flex-1">Yes, Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};