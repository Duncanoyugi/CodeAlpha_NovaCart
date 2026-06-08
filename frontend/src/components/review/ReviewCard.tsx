import React from 'react';
import { ThumbsUp, Flag } from 'lucide-react';
import type { Review } from '../../types';
import { RatingStars } from '../review/RatingStars';
import { getRelativeTime } from '../../utils';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onReport?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful, onReport }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasLongComment = review.comment.length > 300;

  return (
    <div className="py-6 border-b border-[var(--color-border-light)] last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
            <span className="font-ui text-sm font-bold text-[var(--color-text-secondary)]">
              {review.user_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-ui text-sm font-medium text-[var(--color-text-primary)]">{review.user_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={review.rating} size="sm" />
              {review.is_verified_purchase && (
                <span className="font-ui text-[10px] text-[var(--color-success-text)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full border border-[var(--color-success-border)]">Verified</span>
              )}
            </div>
          </div>
        </div>
        <p className="font-ui text-[11px] text-[var(--color-text-tertiary)]">{getRelativeTime(review.created_at)}</p>
      </div>

      <h4 className="font-ui text-sm font-medium text-[var(--color-text-primary)] mt-3">{review.title}</h4>
      <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
        {isExpanded ? review.comment : review.comment.slice(0, 300)}
        {hasLongComment && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-[var(--color-text-accent)] hover:underline">
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {review.admin_response && (
        <div className="mt-3 p-3 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)]">
          <p className="font-ui text-[11px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Store Response</p>
          <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">{review.admin_response}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => onHelpful?.(review.id, true)} className="flex items-center gap-1.5 font-ui text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-accent)] transition-colors">
          <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpful_count})
        </button>
        <button onClick={() => onReport?.(review.id)} className="flex items-center gap-1.5 font-ui text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] transition-colors">
          <Flag className="w-4 h-4" /> Report
        </button>
      </div>
    </div>
  );
};
