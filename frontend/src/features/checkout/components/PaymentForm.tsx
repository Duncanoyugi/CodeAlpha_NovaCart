import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CreditCard, Lock, Wallet } from 'lucide-react';
import type { CheckoutFormData } from '../schemas/checkoutSchema';

export const PaymentForm: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[var(--color-gold-500)]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Payment Method</h3>
          <p className="font-ui text-xs text-[var(--color-text-tertiary)]">Choose your preferred payment option</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Stripe Option */}
        <label className={`flex items-center gap-4 p-5 rounded-[var(--radius-xl)] border-2 cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-md)] bg-[var(--color-bg-raised)]`}>
          <input
            type="radio"
            value="stripe"
            {...register('payment_method')}
            className="w-5 h-5 accent-[var(--color-gold-500)] cursor-pointer"
            defaultChecked
          />
          <div className="w-12 h-12 rounded-full bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-[#635BFF]" />
          </div>
          <div className="flex-1">
            <p className="font-ui text-sm font-bold text-[var(--color-text-primary)]">Credit / Debit Card</p>
            <p className="text-xs text-[var(--color-text-tertiary)] font-ui">Pay securely with Stripe</p>
          </div>
          <div className="flex gap-1.5">
            <div className="px-2 py-1 rounded bg-[#1A1F71] text-white text-[10px] font-bold">VISA</div>
            <div className="px-2 py-1 rounded bg-[#EB001B] text-white text-[10px] font-bold">MC</div>
          </div>
        </label>

        {/* Cash on Delivery Option */}
        <label className={`flex items-center gap-4 p-5 rounded-[var(--radius-xl)] border-2 cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-md)] bg-[var(--color-bg-raised)]`}>
          <input
            type="radio"
            value="cod"
            {...register('payment_method')}
            className="w-5 h-5 accent-[var(--color-gold-500)] cursor-pointer"
          />
          <div className="w-12 h-12 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-[var(--color-gold-500)]" />
          </div>
          <div className="flex-1">
            <p className="font-ui text-sm font-bold text-[var(--color-text-primary)]">Cash on Delivery</p>
            <p className="text-xs text-[var(--color-text-tertiary)] font-ui">Pay when you receive your order</p>
          </div>
          <span className="text-2xl">💵</span>
        </label>

        {errors.payment_method && (
          <p className="text-sm text-[var(--color-danger-text)] font-ui font-medium">{errors.payment_method.message}</p>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-3 justify-center px-4 py-3.5 rounded-[var(--radius-lg)] bg-[var(--color-success-bg)] border border-[var(--color-success-border)]">
        <Lock className="w-4 h-4 text-[var(--color-success-text)]" />
        <span className="text-xs font-ui font-medium text-[var(--color-success-text)]">Your payment information is encrypted and secure</span>
      </div>
    </div>
  );
};