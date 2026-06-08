import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FILTERS } from '../../utils/constants';

export const ProductFilters: React.FC<{
  categories: any[];
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

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <h3 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">Filters</h3>
        </div>
        <button onClick={onClearFilters} className="font-ui text-xs uppercase tracking-[0.06em] text-[var(--color-danger-text)] hover:underline">Clear All</button>
      </div>

      <div>
        <h4 className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-3">Category</h4>
        <div className="space-y-2">
          <button onClick={() => onCategoryChange('')} className={`block w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-sm font-ui transition ${!selectedCategory ? 'bg-[var(--color-gold-50)] text-[var(--color-gold-800)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'}`}>
            All Categories
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => onCategoryChange(cat.id)} className={`block w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-sm font-ui transition ${selectedCategory === cat.id ? 'bg-[var(--color-gold-50)] text-[var(--color-gold-800)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
          <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
        </div>
        <button onClick={handlePriceApply} className="mt-2 w-full font-ui text-xs uppercase tracking-[0.06em] py-2 border border-[var(--color-gold-400)] text-[var(--color-text-accent)] rounded-[var(--radius-md)] hover:bg-[var(--color-gold-50)] transition-colors">Apply</button>
      </div>

      <div>
        <h4 className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-3">Rating</h4>
        <div className="space-y-2">
          {FILTERS.RATINGS.map((rating) => (
            <button key={rating.value} onClick={() => handleRatingSelect(rating.value)} className={`flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-md)] text-sm font-ui transition ${selectedRating === rating.value ? 'bg-[var(--color-gold-50)] text-[var(--color-gold-800)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'}`}>
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < rating.value ? 'text-[var(--color-gold-400)]' : 'text-[var(--color-border-strong)]'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}</div>
              <span className="text-xs">{rating.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-3">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={inStockOnly} onChange={handleAvailabilityToggle} className="rounded border-[var(--color-border-medium)] accent-[var(--color-gold-400)]" />
          <span className="text-sm font-ui text-[var(--color-text-secondary)]">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};
