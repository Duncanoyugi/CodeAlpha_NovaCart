import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { CheckoutFormData } from '../schemas/checkoutSchema';

export const BillingForm: React.FC = () => {
  const { register, formState: { errors }, control } = useFormContext<CheckoutFormData>();
  const sameAsShipping = useWatch({ control, name: 'billing_address.same_as_shipping', defaultValue: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Billing Information</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('billing_address.same_as_shipping')} className="rounded border-[var(--color-border-medium)] accent-[var(--color-gold-400)]" />
          <span className="font-ui text-sm text-[var(--color-text-secondary)]">Same as shipping</span>
        </label>
      </div>

      {!sameAsShipping && (
        <div className="space-y-4 pt-4 border-t border-[var(--color-border-light)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">Full Name *</label>
              <input {...register('billing_address.full_name')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
              {errors.billing_address?.full_name && <p className="mt-1 text-xs text-[var(--color-danger-text)]">{errors.billing_address.full_name.message}</p>}
            </div>
            <div>
              <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">Address Line 1 *</label>
              <input {...register('billing_address.address_line1')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
              {errors.billing_address?.address_line1 && <p className="mt-1 text-xs text-[var(--color-danger-text)]">{errors.billing_address.address_line1.message}</p>}
            </div>
          </div>
          <div>
            <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">Address Line 2</label>
            <input {...register('billing_address.address_line2')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">City *</label>
              <input {...register('billing_address.city')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
            </div>
            <div>
              <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">State *</label>
              <input {...register('billing_address.state')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
            </div>
            <div>
              <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">Postal Code *</label>
              <input {...register('billing_address.postal_code')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">Country *</label>
            <select {...register('billing_address.country')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none">
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
