import React, { useState } from 'react';
import { ThumbsUp, Flag, MessageCircle } from 'lucide-react';
import type { Review } from '../../types';
import { RatingStars } from './RatingStars';
import { formatDate, getRelativeTime, truncateText } from '../../utils';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onReport?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful, onReport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLongComment = review.comment.length > 300;

  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            {review.user_avatar ? (
              <img src={review.user_avatar} alt={review.user_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-primary-600 font-semibold">
                {review.user_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-800">{review.user_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={review.rating} size="sm" />
              {review.is_verified_purchase && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400" title={formatDate(review.created_at)}>
            {getRelativeTime(review.created_at)}
          </p>
        </div>
      </div>

      {/* Review Title */}
      <h4 className="font-semibold text-gray-800 mt-3">{review.title}</h4>

      {/* Review Comment */}
      <p className="text-gray-600 mt-2 leading-relaxed">
        {isExpanded ? review.comment : truncateText(review.comment, 300)}
        {hasLongComment && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-700 ml-2 text-sm"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.slice(0, 3).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition"
            />
          ))}
          {review.images.length > 3 && (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
              +{review.images.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Admin Response */}
      {review.admin_response && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <MessageCircle className="w-4 h-4" />
            <span>Store Owner Response</span>
          </div>
          <p className="text-sm text-gray-600">{review.admin_response}</p>
          {review.admin_response_at && (
            <p className="text-xs text-gray-400 mt-1">{formatDate(review.admin_response_at)}</p>
          )}
        </div>
      )}

      {/* Helpful Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => onHelpful?.(review.id, true)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpful_count})</span>
        </button>
        <button
          onClick={() => onReport?.(review.id)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition"
        >
          <Flag className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>
    </div>
  );
};