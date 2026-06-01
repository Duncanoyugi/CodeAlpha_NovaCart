import { z } from 'zod';

// Phone number validation
const phoneRegex = /^\+?1?\d{9,15}$/;
const postalCodeRegex = /^\d{5}(-\d{4})?$/;

export const shippingAddressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number (e.g., +1234567890)'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(postalCodeRegex, 'Invalid postal code'),
  country: z.string().min(2, 'Country is required').default('US'),
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
}).refine(
  (data) => {
    if (!data.same_as_shipping) {
      return data.full_name && data.address_line1 && data.city && data.state && data.postal_code;
    }
    return true;
  },
  {
    message: 'Billing address is required when not same as shipping',
    path: ['billing_address'],
  }
);

export const checkoutSchema = z.object({
  shipping_address: shippingAddressSchema,
  billing_address: billingAddressSchema,
  payment_method: z.string().min(1, 'Payment method is required'),
  customer_notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  coupon_code: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>;