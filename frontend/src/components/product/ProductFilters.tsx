import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { FILTERS } from '../../utils/constants';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <div className="pb-6 border-b border-[var(--color-border)] last:border-0 last:pb-0">
    <h4 className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-4">{title}</h4>
    {children}
  </div>
);

export const ProductFilters: React.FC<{
  categories: { id: string; name: string }[];
  selectedCategory?: string;
  onCategoryChange: (id: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onRatingChange: (rating?: number) => void;
  onAvailabilityChange: (inStock?: boolean) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}> = ({ categories, selectedCategory, onCategoryChange, onPriceChange, onRatingChange, onAvailabilityChange, onClearFilters, isMobile }) => {
  const [priceRange, setPriceRange] = React.useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = React.useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = React.useState(false);

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

  const activeBadge = (label: string, onClear: () => void) => (
    <Badge variant="primary" size="sm" className="gap-1.5 pr-1">
      {label}
      <button onClick={onClear} className="hover:text-[var(--color-danger)] transition-colors" aria-label={`Remove ${label} filter`}>
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );

  const content = (
    <div className={`${isMobile ? 'p-5' : ''}`}>
      {isMobile && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h3 className="font-body text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">Filters</h3>
          </div>
          <button onClick={onClearFilters} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors" aria-label="Clear all filters">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <FilterSection title="Category">
        <div className="space-y-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-body transition-all duration-150 ${
              !selectedCategory
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-body transition-all duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs">$</span>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] pl-7 pr-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs">$</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] pl-7 pr-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
              />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={handlePriceApply}>
            Apply Price
          </Button>
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="space-y-1.5">
          {FILTERS.RATINGS.map((rating) => (
            <button
              key={rating.value}
              onClick={() => handleRatingSelect(rating.value)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-body transition-all duration-150 ${
                selectedRating === rating.value
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= rating.value ? 'text-[var(--color-accent)]' : 'text-[var(--color-border-strong)]'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={handleAvailabilityToggle}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors duration-150 ${inStockOnly ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-medium)]'}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-150 ${inStockOnly ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-body text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">In Stock Only</span>
        </label>
      </FilterSection>

      {!isMobile && (
        <div className="pt-6">
          <Button variant="outline" size="sm" className="w-full" onClick={onClearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return <div>{content}</div>;
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
      {content}
    </div>
  );
};
