import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CreditCard, Lock } from 'lucide-react';
import type { CheckoutFormData } from '../schemas/checkoutSchema';

export const PaymentForm: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payment Method</h3>

      <div className="space-y-4">
        {/* Stripe Option */}
        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
          <input
            type="radio"
            value="stripe"
            {...register('payment_method')}
            className="text-primary-600 focus:ring-primary-500"
            defaultChecked
          />
          <CreditCard className="w-6 h-6 text-gray-500" />
          <div className="flex-1">
            <p className="font-medium">Credit / Debit Card</p>
            <p className="text-sm text-gray-500">Pay securely with Stripe</p>
          </div>
          <div className="flex gap-1">
            <img src="https://cdn.jsdelivr.net/gh/amcharts/amcharts4@master/src/images/visa.png" alt="Visa" className="h-6" />
            <img src="https://cdn.jsdelivr.net/gh/amcharts/amcharts4@master/src/images/mastercard.png" alt="Mastercard" className="h-6" />
          </div>
        </label>

        {/* Cash on Delivery Option */}
        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
          <input
            type="radio"
            value="cod"
            {...register('payment_method')}
            className="text-primary-600 focus:ring-primary-500"
          />
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-lg">💰</span>
          </div>
          <div className="flex-1">
            <p className="font-medium">Cash on Delivery</p>
            <p className="text-sm text-gray-500">Pay when you receive your order</p>
          </div>
        </label>

        {errors.payment_method && (
          <p className="text-sm text-red-600">{errors.payment_method.message}</p>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 justify-center text-sm text-gray-500 pt-4">
        <Lock className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </div>
  );
};