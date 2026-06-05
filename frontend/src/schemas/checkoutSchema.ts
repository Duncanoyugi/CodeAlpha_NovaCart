import { z } from 'zod';

const phoneRegex = /^\+?1?\d{9,15}$/;

export const shippingAddressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  address_line1: z.string().min(1, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().default('US'),
});

export const billingAddressSchema = z.object({
  same_as_shipping: z.boolean().default(true),
  full_name: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

export const checkoutSchema = z.object({
  shipping_address: shippingAddressSchema,
  billing_address: billingAddressSchema,
  payment_method: z.string().default('stripe'),
  customer_notes: z.string().optional(),
  coupon_code: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>;