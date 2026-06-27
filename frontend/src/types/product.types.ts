export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Category;
  children?: Category[];
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  stock_quantity: number;
  attributes: Record<string, string>;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  compare_price?: number;
  final_price: number;
  cost_per_item?: number;
  category: Category;
  category_name?: string;
  category_slug?: string;
  image_url: string;
  images: string[];
  stock_quantity: number;
  sku: string;
  barcode?: string;
  tags: string[];
  weight?: number;
  discount_percentage: number;
  is_available: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  rating: number;
  num_reviews: number;
  views_count: number;
  sold_count: number;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  page?: number;
  page_size?: number;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  on_sale?: boolean;
  in_stock?: boolean;
  min_rating?: number;
  tags?: string;
}

export interface ProductListResponse {
  data: {
    products: Product[];
    pagination: {
      total_count: number;
      total_pages: number;
      current_page: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
}