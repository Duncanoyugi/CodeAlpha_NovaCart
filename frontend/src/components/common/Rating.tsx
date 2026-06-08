import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface RatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  readonly = true,
  size = 'md',
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(max)].map((_, index) => {
        const starRatingValue = index + 1;
        const isFilled = hoverValue !== null
          ? starRatingValue <= hoverValue
          : starRatingValue <= value;

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => handleStarClick(starRatingValue)}
            onMouseEnter={() => handleMouseEnter(starRatingValue)}
            className={`transition-colors duration-150 focus:outline-none ${
              readonly
                ? 'cursor-default text-[var(--color-gold-400)]'
                : 'cursor-pointer hover:scale-110 active:scale-95 text-[var(--color-gold-400)] focus:ring-1 focus:ring-[var(--color-gold-400)] focus:ring-offset-1 rounded-full'
            }`}
          >
            <Star
              className={`${starSizes[size]}`}
              fill={isFilled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
