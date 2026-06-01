export interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  coupon_code?: string;
  coupon_discount?: number;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  items: OrderItem[];
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  customer_notes?: string;
  placed_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_image: string;
  variant_name?: string;
  variant_attributes?: Record<string, string>;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  discount_applied: number;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BillingAddress {
  same_as_shipping: boolean;
  full_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface CheckoutData {
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  payment_method: string;
  customer_notes?: string;
  coupon_code?: string;
}

export interface CheckoutResponse {
  order_id: string;
  order_number: string;
  total_amount: number;
  status: string;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}