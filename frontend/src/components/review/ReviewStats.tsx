import React from 'react';
import { Star } from 'lucide-react';
import type { ReviewStats as ReviewStatsType } from '../../types';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  onRatingFilter?: (rating: number | null) => void;
  selectedRating?: number | null;
}

const ratings = [5, 4, 3, 2, 1] as const;

export const ReviewStats: React.FC<ReviewStatsProps> = ({
  stats,
  onRatingFilter,
  selectedRating,
}) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {/* Average Rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-800">{stats.average_rating}</div>
        <div className="flex justify-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="w-5 h-5"
              fill={star <= Math.round(stats.average_rating) ? '#fbbf24' : '#e5e7eb'}
              stroke={star <= Math.round(stats.average_rating) ? '#fbbf24' : '#e5e7eb'}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">{stats.total_reviews} reviews</p>
      </div>

      {/* Rating Distribution */}
      <div className="mt-6 space-y-2">
        {ratings.map((rating) => {
          const distribution = stats.rating_distribution[rating.toString() as keyof typeof stats.rating_distribution];
          const percentage = distribution?.percentage || 0;
          const count = distribution?.count || 0;

          return (
            <button
              key={rating}
              onClick={() => onRatingFilter?.(selectedRating === rating ? null : rating)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition ${
                selectedRating === rating ? 'bg-primary-50' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium w-8">{rating}★</span>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-500 w-16 text-right">{percentage}%</span>
              <span className="text-xs text-gray-400 w-12 text-right">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Verified Purchases</span>
          <span>{stats.verified_purchases}</span>
        </div>
        <div className="flex justify-between">
          <span>Reviews with Images</span>
          <span>{stats.reviews_with_images}</span>
        </div>
      </div>
    </div>
  );
};