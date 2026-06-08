import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStatsProps {
  stats: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, { percentage: number; count: number }>;
  };
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const ratings = [5, 4, 3, 2, 1] as const;

  return (
    <div className="bg-[var(--color-bg-muted)] rounded-[var(--radius-xl)] p-6">
      <div className="text-center mb-6">
        <p className="font-display text-4xl font-bold text-[var(--color-text-primary)]">{stats.average_rating.toFixed(1)}</p>
        <div className="flex justify-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5" fill={star <= Math.round(stats.average_rating) ? 'var(--color-gold-400)' : 'var(--color-border-strong)'} stroke={star <= Math.round(stats.average_rating) ? 'var(--color-gold-400)' : 'var(--color-border-strong)'} />
          ))}
        </div>
        <p className="font-ui text-xs text-[var(--color-text-tertiary)] mt-2">{stats.total_reviews} reviews</p>
      </div>

      <div className="space-y-2">
        {ratings.map((rating) => {
          const dist = stats.rating_distribution[rating.toString() as keyof typeof stats.rating_distribution];
          const percentage = dist?.percentage || 0;
          const count = dist?.count || 0;
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="font-ui text-xs text-[var(--color-text-secondary)] w-8">{rating}★</span>
              <div className="flex-1 h-2 bg-[var(--color-bg-raised)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-gold-400)] rounded-full" style={{ width: `${percentage}%` }} />
              </div>
              <span className="font-ui text-[11px] text-[var(--color-text-tertiary)] w-10 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
