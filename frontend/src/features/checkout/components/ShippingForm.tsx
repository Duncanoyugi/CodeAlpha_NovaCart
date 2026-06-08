import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MapPin, Mail, Phone, User } from 'lucide-react';
import type { CheckoutFormData } from '../schemas/checkoutSchema';
import { Input } from '../../../components/common/Input';

export const ShippingForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Shipping Information</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" icon={<User className="w-5 h-5" />} error={errors.shipping_address?.full_name?.message} {...register('shipping_address.full_name')} />
        <Input label="Email" type="email" icon={<Mail className="w-5 h-5" />} error={errors.shipping_address?.email?.message} {...register('shipping_address.email')} />
      </div>

      <Input label="Phone" icon={<Phone className="w-5 h-5" />} error={errors.shipping_address?.phone?.message} {...register('shipping_address.phone')} />

      <Input label="Address Line 1" icon={<MapPin className="w-5 h-5" />} error={errors.shipping_address?.address_line1?.message} {...register('shipping_address.address_line1')} />

      <Input label="Address Line 2 (Optional)" {...register('shipping_address.address_line2')} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="City" error={errors.shipping_address?.city?.message} {...register('shipping_address.city')} />
        <Input label="State" error={errors.shipping_address?.state?.message} {...register('shipping_address.state')} />
        <Input label="Postal Code" error={errors.shipping_address?.postal_code?.message} {...register('shipping_address.postal_code')} />
      </div>

      <Input label="Country" error={errors.shipping_address?.country?.message} {...register('shipping_address.country')} />
    </div>
  );
};
