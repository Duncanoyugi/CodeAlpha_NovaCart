import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MapPin, Mail, Phone, User } from 'lucide-react';
import type { CheckoutFormData } from '../schemas/checkoutSchema';

export const ShippingForm: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Shipping Information</h3>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('shipping_address.full_name')}
            className="input-field pl-10"
            placeholder="John Doe"
          />
        </div>
        {errors.shipping_address?.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.shipping_address.full_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            {...register('shipping_address.email')}
            className="input-field pl-10"
            placeholder="you@example.com"
          />
        </div>
        {errors.shipping_address?.email && (
          <p className="mt-1 text-sm text-red-600">{errors.shipping_address.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('shipping_address.phone')}
            className="input-field pl-10"
            placeholder="+1234567890"
          />
        </div>
        {errors.shipping_address?.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.shipping_address.phone.message}</p>
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
            {...register('shipping_address.address_line1')}
            className="input-field pl-10"
            placeholder="123 Main Street"
          />
        </div>
        {errors.shipping_address?.address_line1 && (
          <p className="mt-1 text-sm text-red-600">{errors.shipping_address.address_line1.message}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 2 (Optional)
        </label>
        <input
          {...register('shipping_address.address_line2')}
          className="input-field"
          placeholder="Apartment, Suite, etc."
        />
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input {...register('shipping_address.city')} className="input-field" placeholder="New York" />
          {errors.shipping_address?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.shipping_address.city.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <input {...register('shipping_address.state')} className="input-field" placeholder="NY" />
          {errors.shipping_address?.state && (
            <p className="mt-1 text-sm text-red-600">{errors.shipping_address.state.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
          <input {...register('shipping_address.postal_code')} className="input-field" placeholder="10001" />
          {errors.shipping_address?.postal_code && (
            <p className="mt-1 text-sm text-red-600">{errors.shipping_address.postal_code.message}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
        <select {...register('shipping_address.country')} className="input-field">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
          <option value="AU">Australia</option>
        </select>
        {errors.shipping_address?.country && (
          <p className="mt-1 text-sm text-red-600">{errors.shipping_address.country.message}</p>
        )}
      </div>
    </div>
  );
};