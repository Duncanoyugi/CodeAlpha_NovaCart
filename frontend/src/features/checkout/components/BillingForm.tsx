import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { MapPin, User } from 'lucide-react';
import type { CheckoutFormData } from '../schemas/checkoutSchema';

export const BillingForm: React.FC = () => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<CheckoutFormData>();

  const sameAsShipping = useWatch({
    control,
    name: 'billing_address.same_as_shipping',
    defaultValue: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Billing Information</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('billing_address.same_as_shipping')}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">Same as shipping address</span>
        </label>
      </div>

      {!sameAsShipping && (
        <div className="space-y-4 pt-4 border-t">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('billing_address.full_name')}
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
            {errors.billing_address?.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.billing_address.full_name.message}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('billing_address.address_line1')}
                className="input-field pl-10"
                placeholder="123 Main Street"
              />
            </div>
            {errors.billing_address?.address_line1 && (
              <p className="mt-1 text-sm text-red-600">{errors.billing_address.address_line1.message}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2 (Optional)
            </label>
            <input
              {...register('billing_address.address_line2')}
              className="input-field"
              placeholder="Apartment, Suite, etc."
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input {...register('billing_address.city')} className="input-field" placeholder="New York" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <input {...register('billing_address.state')} className="input-field" placeholder="NY" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
              <input {...register('billing_address.postal_code')} className="input-field" placeholder="10001" />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <select {...register('billing_address.country')} className="input-field">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};