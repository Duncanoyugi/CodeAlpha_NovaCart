import type { Product } from './product.types';

export interface WishlistItem {
  id: string;
  product: Product;
  added_at: string;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}