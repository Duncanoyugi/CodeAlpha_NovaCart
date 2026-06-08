import React from 'react';
import { ReviewCard } from './ReviewCard';
import { Pagination } from '../common/Pagination';
import type { Review } from '../../types';

export const ReviewList: React.FC<{
  reviews: Review[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
  onPageChange: (page: number) => void;
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
}> = ({ reviews, pagination, onPageChange, onHelpful }) => {
  if (!reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="font-display text-lg text-[var(--color-text-primary)]">No reviews yet</p>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">Be the first to share your thoughts.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-[var(--color-border-light)]">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onHelpful={onHelpful} />
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};
