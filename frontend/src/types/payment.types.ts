export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface CreatePaymentIntentData {
  order_id: string;
  payment_method?: string;
}

export interface ConfirmPaymentData {
  payment_intent_id: string;
}

export interface RefundPaymentData {
  payment_id: string;
  amount?: number;
  reason?: string;
}