// Common API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// Address Type
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface UserAddress {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing';
  created_at: string;
}

// Error Type
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
