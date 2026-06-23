import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useSearch } from '../../hooks/useSearch';
import { ProductCardSkeleton } from '../common/Skeleton';
import { formatPrice } from '../../utils';

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const {
    query, setQuery,
    suggestions, isSearching,
    recentSearches, isOpen, selectedIndex, setSelectedIndex,
    addRecentSearch, clearRecentSearches,
    open, close,
  } = useSearch(300);

  const showSuggestions = isOpen && (query || isSearching || suggestions.length > 0 || recentSearches.length > 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-bar-container')) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  const handleSelect = (term: string) => {
    addRecentSearch(term);
    setQuery(term);
    close();
    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query
      ? suggestions
      : [...recentSearches];
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
        close();
        navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      close();
      inputRef.current?.blur();
    }
  };

  const displayItems = query
    ? suggestions
    : recentSearches;

  return (
    <div className="search-bar-container relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
          onFocus={() => { open(); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, categories..."
          className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-full py-2.5 pl-10 pr-20 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-150"
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          role="combobox"
        />
        {query && (
          <button
onClick={() => { setQuery(''); setSelectedIndex(-1); inputRef.current?.focus(); }}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => query.trim() && handleSelect(query.trim())}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] px-4 py-1.5 rounded-full text-xs font-body font-semibold tracking-wide transition-all duration-150"
        >
          Search
        </button>
      </div>

      {showSuggestions && (
        <ul
          id="search-suggestions"
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] overflow-hidden z-50 max-h-96 overflow-y-auto"
        >
          {isSearching && displayItems.length === 0 && !recentSearches.length ? (
            <li className="p-4"><ProductCardSkeleton /></li>
          ) : (
            <>
              {!query && recentSearches.length > 0 && (
                <li className="px-4 pt-3 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Recent Searches</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] font-body font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </li>
              )}
              {!query && recentSearches.map((term, idx) => (
                <li key={term}>
                  <button
                    onMouseDown={() => handleSelect(term)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left transition-colors ${
                      selectedIndex === idx ? 'bg-[var(--color-bg-muted)] text-[var(--color-primary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]'
                    }`}
                    role="option"
                    aria-selected={selectedIndex === idx}
                  >
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                    <span className="flex-1 truncate">{term}</span>
                  </button>
                </li>
              ))}
              {query && suggestions.map((product: any, idx) => (
                <li key={product.id}>
                  <button
                    onMouseDown={() => handleSelect(product.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left transition-colors ${
                      selectedIndex === idx ? 'bg-[var(--color-bg-muted)] text-[var(--color-primary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]'
                    }`}
                    role="option"
                    aria-selected={selectedIndex === idx}
                  >
                    <img
                      src={product.image_url}
                      alt=""
                      className="w-9 h-9 rounded-[var(--radius-md)] object-cover border border-[var(--color-border)] shrink-0"
                    />
                    <span className="flex-1 truncate">{product.name}</span>
                    <span className="text-xs font-semibold text-[var(--color-primary)] shrink-0">{formatPrice(product.final_price)}</span>
                  </button>
                </li>
              ))}
              {query && !isSearching && suggestions.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)] font-body">
                  No products found for "{query}"
                </li>
              )}
              {query && (
                <li className="border-t border-[var(--color-border)]">
                  <button
                    onMouseDown={() => {
                      addRecentSearch(query);
                      close();
                      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs font-body font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] transition-colors"
                  >
                    View all results for "{query}"
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
};
