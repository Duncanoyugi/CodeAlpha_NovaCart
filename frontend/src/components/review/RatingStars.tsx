import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const getStarFill = (value: number) => {
    const currentRating = hoverRating || rating;
    if (value <= currentRating) {
      return '#fbbf24'; // Yellow for filled stars
    }
    return '#e5e7eb'; // Gray for empty stars
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors`}
              fill={getStarFill(value)}
              stroke={getStarFill(value)}
            />
          </button>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};