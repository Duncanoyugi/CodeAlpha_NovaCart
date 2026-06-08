import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useCart } from '../../features/cart';
import { useAuth } from '../../features/auth';
import { ROUTES } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-inverse)] border-b border-[var(--color-border-light)]">
      <nav className="container-normal">
        <div className="flex items-center justify-between h-16 md:h-[64px]">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[var(--color-text-inverse)] hover:text-[var(--color-gold-400)] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display text-2xl font-bold text-[var(--color-text-inverse)] tracking-wide">
              Nova<span className="text-[var(--color-gold-400)]">Cart</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to={ROUTES.PRODUCTS} className="text-xs font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
              Shop
            </Link>
            <Link to={ROUTES.PRODUCTS} className="text-xs font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
              Categories
            </Link>
            <Link to={ROUTES.ABOUT} className="text-xs font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
              About
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                placeholder="Search products..."
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(240,235,224,0.15)] rounded-full py-2 pl-10 pr-4 text-sm text-[var(--color-text-inverse)] placeholder:text-[rgba(240,235,224,0.4)] focus:border-[var(--color-gold-400)] focus:bg-[rgba(255,255,255,0.12)] focus:outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,235,224,0.4)]" />
              <button
                onClick={handleSearchClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[var(--color-gold-400)] text-[var(--color-gold-800)] px-3 py-1 rounded-full text-xs font-bold hover:bg-[var(--color-gold-200)] transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <Link to={ROUTES.WISHLIST} className="hidden sm:flex p-2 text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
              <Heart className="w-5 h-5" />
            </Link>

            <Link to={ROUTES.CART} className="relative p-2 text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-gold-400)] text-[var(--color-gold-800)] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link to={ROUTES.PROFILE} className="hidden md:flex p-2 text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link to={ROUTES.LOGIN} className="hidden md:inline-flex items-center gap-2 text-xs font-ui uppercase tracking-[0.08em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            placeholder="Search products..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(240,235,224,0.15)] rounded-full py-2 pl-10 pr-4 text-sm text-[var(--color-text-inverse)] placeholder:text-[rgba(240,235,224,0.4)] focus:border-[var(--color-gold-400)] focus:outline-none transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,235,224,0.4)]" />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[64px] z-40 bg-[var(--color-bg-inverse)]/95 backdrop-blur-md">
          <div className="flex flex-col p-6 space-y-4">
            <Link
              to={ROUTES.PRODUCTS}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors py-3 border-b border-[rgba(240,235,224,0.08)]"
            >
              Shop All
            </Link>
            <Link
              to={ROUTES.PRODUCTS}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors py-3 border-b border-[rgba(240,235,224,0.08)]"
            >
              Categories
            </Link>
            <Link
              to={ROUTES.ABOUT}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors py-3 border-b border-[rgba(240,235,224,0.08)]"
            >
              About
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-sm font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors py-3 border-b border-[rgba(240,235,224,0.08)]"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <div className="pt-4 border-t border-[rgba(240,235,224,0.08)]">
              {isAuthenticated ? (
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors py-2"
                >
                  <User className="w-5 h-5" />
                  <span>My Account</span>
                </Link>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-ui uppercase tracking-[0.1em] text-[rgba(240,235,224,0.75)] hover:text-[var(--color-gold-400)] transition-colors py-2"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
