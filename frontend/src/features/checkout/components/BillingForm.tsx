import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { CheckoutFormData } from '../schemas/checkoutSchema';
import { Input } from '../../../components/common/Input';

export const BillingForm: React.FC = () => {
  const { register, formState: { errors }, control } = useFormContext<CheckoutFormData>();
  const sameAsShipping = useWatch({ control, name: 'billing_address.same_as_shipping', defaultValue: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-gold-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Billing Address</h3>
            <p className="font-ui text-xs text-[var(--color-text-tertiary)]">Where should we send the invoice?</p>
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer group bg-[var(--color-bg-muted)] px-4 py-2.5 rounded-[var(--radius-lg)] hover:bg-[var(--color-border-light)] transition-all">
          <input type="checkbox" {...register('billing_address.same_as_shipping')} className="w-4 h-4 rounded accent-[var(--color-gold-500)] cursor-pointer" />
          <span className="font-ui text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors font-medium">Same as shipping</span>
        </label>
      </div>

      {!sameAsShipping && (
        <div className="space-y-5 pt-4 border-t border-[var(--color-border-light)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              error={errors.billing_address?.full_name?.message}
              placeholder="John Doe"
              {...register('billing_address.full_name')}
            />
            <Input
              label="Address Line 1"
              error={errors.billing_address?.address_line1?.message}
              placeholder="123 Main Street"
              {...register('billing_address.address_line1')}
            />
          </div>
          <Input
            label="Address Line 2 (Optional)"
            placeholder="Apt 4B, Suite 200"
            {...register('billing_address.address_line2')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              error={errors.billing_address?.city?.message}
              placeholder="New York"
              {...register('billing_address.city')}
            />
            <Input
              label="State"
              error={errors.billing_address?.state?.message}
              placeholder="NY"
              {...register('billing_address.state')}
            />
            <Input
              label="Postal Code"
              error={errors.billing_address?.postal_code?.message}
              placeholder="10001"
              {...register('billing_address.postal_code')}
            />
          </div>
          <Input
            label="Country"
            error={errors.billing_address?.country?.message}
            {...register('billing_address.country')}
          />
        </div>
      )}
    </div>
  );
};
