import type { Product } from './product.types';

export interface Review {
  id: string;
  product: string;
  product_details?: Product;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  video_url?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  not_helpful_count: number;
  helpful_percentage: number;
  admin_response?: string;
  admin_response_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    '5': { count: number; percentage: number };
    '4': { count: number; percentage: number };
    '3': { count: number; percentage: number };
    '2': { count: number; percentage: number };
    '1': { count: number; percentage: number };
  };
  verified_purchases: number;
  reviews_with_images: number;
}

export interface CreateReviewData {
  product: string;
  order?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  video_url?: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
  video_url?: string;
}

export interface ReviewState {
  reviews: Review[];
  stats: ReviewStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}