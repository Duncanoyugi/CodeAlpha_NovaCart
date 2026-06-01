import type { Product, ProductVariant } from './product.types';

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price_at_add: number;
  subtotal: number;
  current_price: number;
  savings: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
}

export interface AddToCartData {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface UpdateCartData {
  id: string;
  quantity: number;
}

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
}