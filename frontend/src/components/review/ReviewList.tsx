import React from 'react';
import { ReviewCard } from './ReviewCard';
import { Pagination } from '../common/Pagination';
import type { Review } from '../../types';

interface ReviewListProps {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
  isLoading?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  pagination,
  onPageChange,
  onHelpful,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onHelpful={onHelpful} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};