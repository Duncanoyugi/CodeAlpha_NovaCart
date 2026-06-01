import React from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import type { Review } from '../../../types';
import { formatDate } from '../../../utils';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{review.user_name}</p>
          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
          <span>{review.rating}</span>
          <span>★</span>
        </div>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">{review.title}</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">{review.comment}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-primary-600" />
          <span>{review.helpful_count || 0} people found this helpful</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary-600" />
          <span>{review.is_verified_purchase ? 'Verified purchase' : 'Verified reviewer'}</span>
        </div>
      </div>
    </div>
  );
};