import React from 'react';
import { X, MapPin, Truck, Calendar, Package } from 'lucide-react';
import type { Order } from '../../../types';
import { formatPrice, formatDate } from '../../../utils';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../../utils/constants';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    if (type === 'order') {
      const config = ORDER_STATUS[status as keyof typeof ORDER_STATUS];
      return config?.color || 'bg-gray-100 text-gray-700';
    }
    const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS];
    return config?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{order.order_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Order Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status, 'order')}`}>
                {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Payment Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.payment_status, 'payment')}`}>
                {PAYMENT_STATUS[order.payment_status as keyof typeof PAYMENT_STATUS]?.label || order.payment_status}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                   <p className="font-medium">{order.shipping_full_name || 'N/A'}</p>
                   <p className="text-sm text-gray-500">{order.shipping_email || 'N/A'}</p>
                   <p className="text-sm text-gray-500">{order.shipping_phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Shipping Address</p>
                   <p className="text-sm text-gray-500">
                     {order.shipping_address_line1}<br />
                     {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                     {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}<br />
                     {order.shipping_country}
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price_per_unit)}</p>
                    <p className="text-sm text-gray-500">Total: {formatPrice(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking Information (if available) */}
          {order.tracking_number && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-2">
                <Truck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Tracking Information</p>
                  <p className="text-sm text-gray-500">
                    Carrier: {order.carrier?.toUpperCase() || 'N/A'}<br />
                    Tracking Number: {order.tracking_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="border-t pt-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.placed_at, 'MMMM dd, yyyy h:mm a')}</p>
                {order.updated_at !== order.placed_at && (
                  <p className="text-sm text-gray-500">Last updated on {formatDate(order.updated_at, 'MMMM dd, yyyy h:mm a')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};