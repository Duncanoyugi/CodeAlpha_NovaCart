import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useSearch } from '../../hooks/useSearch';
import { ProductCardSkeleton } from '../common/Skeleton';
import { formatPrice } from '../../utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query, setQuery,
    suggestions, isSearching,
    recentSearches,
    selectedIndex, setSelectedIndex,
    addRecentSearch, clearRecentSearches,
    open: openSearch, close: closeSearch,
  } = useSearch(300);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      openSearch();
    } else {
      closeSearch();
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, setSelectedIndex]);

  const handleSelect = (term: string) => {
    addRecentSearch(term);
    setQuery(term);
    onClose();
    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? suggestions : [...recentSearches];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        const term = typeof items[selectedIndex] === 'string' ? items[selectedIndex] : items[selectedIndex]?.name;
        if (term) handleSelect(term);
      } else if (query.trim()) {
        addRecentSearch(query.trim());
        onClose();
        navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const displayItems = query ? suggestions : recentSearches;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--color-bg)] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <Search className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, categories..."
          className="flex-1 bg-transparent text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
        />
        <button
          onClick={onClose}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching && displayItems.length === 0 && !recentSearches.length ? (
          <div className="p-4"><ProductCardSkeleton /></div>
        ) : (
          <ul role="listbox" className="max-w-2xl mx-auto">
            {!query && recentSearches.length > 0 && (
              <li className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Recent Searches</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[10px] font-body font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </li>
            )}
            {!query && recentSearches.map((term, idx) => (
              <li key={term}>
                <button
                  onMouseDown={() => handleSelect(term)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-base font-body text-left transition-colors ${
                    selectedIndex === idx ? 'bg-[var(--color-bg-muted)] text-[var(--color-primary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  <Clock className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                  <span className="flex-1">{term}</span>
                </button>
              </li>
            ))}
            {query && suggestions.map((product: any, idx) => (
              <li key={product.id}>
                <button
                  onMouseDown={() => handleSelect(product.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-base font-body text-left transition-colors ${
                    selectedIndex === idx ? 'bg-[var(--color-bg-muted)] text-[var(--color-primary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  <img
                    src={product.image_url}
                    alt=""
                    className="w-11 h-11 rounded-[var(--radius-md)] object-cover border border-[var(--color-border)] shrink-0"
                  />
                  <span className="flex-1 truncate">{product.name}</span>
                  <span className="text-sm font-semibold text-[var(--color-primary)] shrink-0">{formatPrice(product.final_price)}</span>
                </button>
              </li>
            ))}
            {query && !isSearching && suggestions.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)] font-body">
                No products found for "{query}"
              </li>
            )}
            {query && (
              <li className="border-t border-[var(--color-border)]">
                <button
                  onMouseDown={() => {
                    addRecentSearch(query);
                    onClose();
                    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-4 text-sm font-body font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  View all results for "{query}"
                  <ArrowRight className="w-4 h-4" />
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
