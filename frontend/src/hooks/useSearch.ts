import { useState, useEffect, useCallback, useRef } from 'react';

const RECENT_SEARCHES_KEY = 'novacart_recent_searches';
const MAX_RECENT = 5;

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try { setRecentSearches(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/?search=${encodeURIComponent(searchQuery)}&page_size=6`,
        { signal: abortControllerRef.current.signal }
      );
      const data = await res.json();
      const list = data?.data?.products ?? data?.products ?? [];
      setSuggestions(list);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        setSuggestions([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    searchProducts(debouncedQuery);
  }, [debouncedQuery, searchProducts]);

  const addRecentSearch = useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setRecentSearches((prev) => {
      const next = [cleaned, ...prev.filter((s) => s !== cleaned)].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_SEARCHES_KEY); } catch {}
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  return {
    query, setQuery,
    debouncedQuery,
    suggestions, isSearching,
    recentSearches,
    isOpen, selectedIndex, setSelectedIndex,
    addRecentSearch, clearRecentSearches,
    open, close,
  };
}
