import React from 'react';
import type { ReviewStats as ReviewStatsType } from '../../../types';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

const ratingLabels = {
  '5': 'Excellent',
  '4': 'Very Good',
  '3': 'Good',
  '2': 'Fair',
  '1': 'Poor',
};

export const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const distribution = Object.entries(stats.rating_distribution) as [keyof typeof ratingLabels, { count: number; percentage: number }][];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-3xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Average rating</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-900">{stats.total_reviews}</p>
            <p className="text-sm text-gray-500">Total reviews</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Rating distribution</h3>
        <div className="space-y-3 mt-4">
          {distribution.map(([rating, data]) => (
            <div key={rating} className="flex items-center gap-4">
              <span className="w-10 text-sm text-gray-600">{rating}★</span>
              <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-primary-600"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm text-gray-600">{data.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Verified purchases</span>
          <span>{stats.verified_purchases}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <span>Reviews with images</span>
          <span>{stats.reviews_with_images}</span>
        </div>
      </div>
    </div>
  );
};