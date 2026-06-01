import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FILTERS } from '../../utils/constants';

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onRatingChange: (rating?: number) => void;
  onAvailabilityChange: (inStock?: boolean) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onAvailabilityChange,
  onClearFilters,
  isMobile = false,
}) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);

  const handlePriceApply = () => {
    const min = priceRange.min ? Number(priceRange.min) : undefined;
    const max = priceRange.max ? Number(priceRange.max) : undefined;
    onPriceChange(min, max);
  };

  const handleRatingSelect = (rating: number) => {
    const newRating = selectedRating === rating ? undefined : rating;
    setSelectedRating(newRating);
    onRatingChange(newRating);
  };

  const handleAvailabilityToggle = () => {
    const newValue = !inStockOnly;
    setInStockOnly(newValue);
    onAvailabilityChange(newValue);
  };

  const categoriesList = Array.isArray(categories) ? categories : [];

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`block w-full text-left px-2 py-1 rounded transition ${
              !selectedCategory ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categoriesList.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`block w-full text-left px-2 py-1 rounded transition ${
                selectedCategory === category.id
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="input-field"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="mt-2 w-full btn-secondary text-sm py-1"
        >
          Apply
        </button>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-3">Customer Rating</h4>
        <div className="space-y-2">
          {FILTERS.RATINGS.map((rating) => (
            <button
              key={rating.value}
              onClick={() => handleRatingSelect(rating.value)}
              className={`flex items-center gap-2 w-full px-2 py-1 rounded transition ${
                selectedRating === rating.value
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating.value ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm">{rating.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-medium mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={handleAvailabilityToggle}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};