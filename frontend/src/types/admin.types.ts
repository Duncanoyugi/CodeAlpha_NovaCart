import type { Order } from './index';

export interface DashboardStats {
  total_revenue: number;
  revenue_growth: number;
  total_orders: number;
  average_order_value: number;
  total_customers: number;
  new_customers: number;
  total_products: number;
  out_of_stock: number;
  pending_orders: number;
  processing_orders: number;
  recent_orders?: Order[];
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  average_order: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  total_sold: number;
  total_revenue: number;
  stock: number;
}

export interface CategorySales {
  id: string;
  name: string;
  total_sold: number;
  total_revenue: number;
}

export interface CustomerInsights {
  total_customers: number;
  customer_lifetime_value: number;
  repeat_customers: number;
  repeat_purchase_rate: number;
  verified_customers: number;
  customers_with_reviews: number;
}

export interface InventoryStatus {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  needs_reorder: Array<{
    id: string;
    name: string;
    sku: string;
    stock_quantity: number;
    sold_count: number;
  }>;
}

export interface AdminProductFilters {
  search?: string;
  category?: string;
  status?: 'available' | 'out_of_stock' | 'all';
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface AdminOrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  is_verified?: boolean;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface ProductFormData {
  name: string;
  slug?: string;
  short_description: string;
  description: string;
  price: number;
  compare_price?: number | null;
  cost_per_item?: number;
  category: string;
  image_url: string;
  images: string[];
  stock_quantity: number;
  sku: string;
  barcode?: string;
  tags: string;
  weight?: number;
  discount_percentage: number;
  is_available: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  meta_title?: string;
  meta_description?: string;
  variants?: ProductVariantFormData[];
}

export interface ProductVariantFormData {
  name: string;
  sku: string;
  price?: number;
  stock_quantity: number;
  attributes: Record<string, string>;
  image_url?: string;
}

export interface OrderStatusUpdateData {
  status: string;
  admin_notes?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface OrderStatusOption {
  value: string;
  label: string;
  color: string;
  nextStatuses?: string[];
}

export interface UserFilters {
  search?: string;
  role?: string;
  is_verified?: boolean;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface UserRoleUpdateData {
  userId: string;
  role: string;
}

export interface UserStatusUpdateData {
  userId: string;
  is_active: boolean;
}

export interface UserVerificationData {
  userId: string;
  is_verified: boolean;
}

export interface RoleOption {
  value: string;
  label: string;
  color: string;
  description: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { 
    value: 'CUSTOMER', 
    label: 'Customer', 
    color: 'bg-green-100 text-green-700',
    description: 'Can browse, purchase, and write reviews'
  },
  { 
    value: 'STAFF', 
    label: 'Staff', 
    color: 'bg-blue-100 text-blue-700',
    description: 'Can manage orders and products'
  },
  { 
    value: 'ADMIN', 
    label: 'Admin', 
    color: 'bg-purple-100 text-purple-700',
    description: 'Full system access'
  },
];