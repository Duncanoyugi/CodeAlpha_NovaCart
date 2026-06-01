import React, { useState } from 'react';
import { X, Truck, Package, CheckCircle, XCircle } from 'lucide-react';
import { useUpdateOrderStatusMutation } from '../api/adminApi';
import toast from 'react-hot-toast';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string;
  currentCarrier?: string;
  onSuccess: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: Package },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500', icon: Package },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-indigo-500', icon: CheckCircle },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-500', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500', icon: XCircle },
];

const carriers = [
  { value: 'usps', label: 'USPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'ups', label: 'UPS' },
  { value: 'dhl', label: 'DHL' },
  { value: 'amazon', label: 'Amazon Logistics' },
];

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentCarrier,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '');
  const [carrier, setCarrier] = useState(currentCarrier || '');
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const handleSubmit = async () => {
    try {
      await updateStatus({
        orderId,
        status: selectedStatus,
        admin_notes: adminNotes || undefined,
        tracking_number: trackingNumber || undefined,
        carrier: carrier || undefined,
        estimated_delivery: estimatedDelivery || undefined,
      }).unwrap();
      
      toast.success('Order status updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (!isOpen) return null;

  const CurrentStatusIcon = statusOptions.find(s => s.value === currentStatus)?.icon || Package;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CurrentStatusIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Update Order Status</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shipping Details (only for shipped/delivered status) */}
          {(selectedStatus === 'shipped' || selectedStatus === 'delivered') && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-800">Shipping Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Carrier</option>
                  {carriers.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input-field"
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Internal)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Add internal notes about this order..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};