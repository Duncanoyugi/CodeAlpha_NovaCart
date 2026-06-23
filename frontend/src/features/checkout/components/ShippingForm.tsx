import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MapPin, Mail, Phone, User, Building2 } from 'lucide-react';
import type { CheckoutFormData } from '../schemas/checkoutSchema';
import { Input } from '../../../components/common/Input';

export const ShippingForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[var(--color-gold-500)]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Shipping Information</h3>
          <p className="font-ui text-xs text-[var(--color-text-tertiary)]">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          icon={<User className="w-5 h-5" />}
          error={errors.shipping_address?.full_name?.message}
          placeholder="John Doe"
          {...register('shipping_address.full_name')}
        />
        <Input
          label="Email Address"
          type="email"
          icon={<Mail className="w-5 h-5" />}
          error={errors.shipping_address?.email?.message}
          placeholder="you@example.com"
          {...register('shipping_address.email')}
        />
      </div>

      <Input
        label="Phone Number"
        type="tel"
        icon={<Phone className="w-5 h-5" />}
        error={errors.shipping_address?.phone?.message}
        placeholder="+1 (555) 000-0000"
        {...register('shipping_address.phone')}
      />

      <Input
        label="Address Line 1"
        icon={<MapPin className="w-5 h-5" />}
        error={errors.shipping_address?.address_line1?.message}
        placeholder="123 Main Street"
        {...register('shipping_address.address_line1')}
      />

      <Input
        label="Address Line 2 (Apartment, suite, etc.)"
        icon={<Building2 className="w-5 h-5" />}
        placeholder="Apt 4B"
        {...register('shipping_address.address_line2')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          error={errors.shipping_address?.city?.message}
          placeholder="New York"
          {...register('shipping_address.city')}
        />
        <Input
          label="State / Province"
          error={errors.shipping_address?.state?.message}
          placeholder="NY"
          {...register('shipping_address.state')}
        />
        <Input
          label="Postal Code"
          error={errors.shipping_address?.postal_code?.message}
          placeholder="10001"
          {...register('shipping_address.postal_code')}
        />
      </div>

      <Input
        label="Country"
        error={errors.shipping_address?.country?.message}
        {...register('shipping_address.country')}
      />
    </div>
  );
};
