import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, User, Search, Menu, X, Sun, Moon,
  ShoppingBag, ChevronDown, LogOut
} from 'lucide-react';
import { useCart } from '../../features/cart';
import { useAuth } from '../../features/auth';
import { ROUTES } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { SearchBar } from './SearchBar';
import { SearchOverlay } from './SearchOverlay';

type CatalogNavigationEntry = {
  label: string;
  slug: string;
  groups?: ReadonlyArray<{
    label: string;
    items: ReadonlyArray<readonly [string, string]>;
  }>;
};

const catalogNavigation: ReadonlyArray<CatalogNavigationEntry> = [
  {
    label: 'Chargers & Cables', slug: 'chargers-cables', groups: [
      { label: 'Chargers', items: [['Type C Chargers', 'type-c-chargers'], ['Micro Chargers', 'micro-chargers'], ['Car Chargers', 'car-chargers']] },
      { label: 'Cables', items: [['Type C Cables', 'type-c-cables'], ['Micro Cables', 'micro-cables'], ['iPhone Cables', 'iphone-cables'], ['C to C Cables', 'c-to-c-cables'], ['4 in 1 Cables', 'four-in-one-cables']] },
    ],
  },
  { label: 'Pods', slug: 'pods' },
  { label: 'Power Banks', slug: 'power-banks' },
  { label: 'Smart Watches', slug: 'smart-watches' },
  { label: 'Shavers', slug: 'shavers' },
  {
    label: 'Earphones & Headphones', slug: 'earphones-headphones', groups: [
      { label: 'Shop by type', items: [['Earphones', 'earphones'], ['Headphones', 'headphones']] },
    ],
  },
  {
    label: 'Brands', slug: 'brands', groups: [
      { label: 'Shop by brand', items: [['Oraimo', 'oraimo'], ['Amaya', 'amaya'], ['Itel', 'itel'], ['Samsung', 'samsung'], ['Recrsi', 'recrsi'], ['Havit', 'havit']] },
    ],
  },
] as const;

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu-container') && !target.closest('.header-dropdown')) {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-inverse)]/95 backdrop-blur-lg border-b border-[var(--color-border-light)]">
      <div className="container-normal">
        <div className="flex items-center justify-between h-16 lg:h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[var(--color-text-inverse)] hover:text-[var(--color-primary)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0 no-underline">
            <img src="/images/playhouse-logo.svg" alt="Playhouse logo" className="w-8 h-8 rounded-[var(--radius-md)] object-cover" />
            <span className="font-display text-xl font-bold text-[var(--color-text-inverse)] tracking-tight">
              Play<span className="text-[var(--color-primary)]">house</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <Link to={ROUTES.PRODUCTS} className="px-3 py-1.5 text-xs font-body font-semibold uppercase tracking-[0.08em] text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-md)] transition-colors">
              Shop All
            </Link>
            {catalogNavigation.map((entry) => entry.groups ? (
              <details key={entry.slug} className="relative group">
                <summary className="list-none cursor-pointer flex items-center gap-1 px-2 py-1.5 text-[11px] font-body font-semibold uppercase tracking-[0.06em] text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-md)] transition-colors">
                  {entry.label}<ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute left-0 top-full mt-2 min-w-52 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)]">
                  <Link to={ROUTES.CATEGORY(entry.slug)} className="block px-3 py-2 text-sm font-body font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] rounded-[var(--radius-md)]">Shop all {entry.label}</Link>
                  {entry.groups.map((group) => <div key={group.label} className="mt-1 pt-2 border-t border-[var(--color-border)]">
                    <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.12em] font-body font-bold text-[var(--color-text-muted)]">{group.label}</p>
                    {group.items.map(([label, slug]) => <Link key={slug} to={ROUTES.CATEGORY(slug)} className="block px-3 py-1.5 text-sm font-body text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] rounded-[var(--radius-md)]">{label}</Link>)}
                  </div>)}
                </div>
              </details>
            ) : <Link key={entry.slug} to={ROUTES.CATEGORY(entry.slug)} className="px-2 py-1.5 text-[11px] font-body font-semibold uppercase tracking-[0.06em] text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-md)] transition-colors">{entry.label}</Link>)}
            <Link to={ROUTES.ABOUT} className="px-3 py-1.5 text-xs font-body font-semibold uppercase tracking-[0.08em] text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-md)] transition-colors">
              About
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-6">
            <SearchBar />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile search toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2.5 -mr-1 text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-white/5 active:scale-95 transition-all"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2.5 text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-white/5 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link to={ROUTES.WISHLIST} className="hidden sm:flex p-2.5 text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-white/5 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to={ROUTES.CART} className="relative p-2.5 text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-white/5 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Shopping cart">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-primary)] text-white text-[10px] font-body font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 shadow-md" aria-live="polite">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Account / User Menu */}
            {isAuthenticated ? (
              <div className="relative header-dropdown">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden md:flex p-2.5 text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-white/5 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/80 flex items-center justify-center">
                    <span className="text-xs font-body font-bold text-white">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <p className="text-sm font-body font-semibold text-[var(--color-text-primary)] truncate">{user?.full_name || 'User'}</p>
                      <p className="text-xs font-body text-[var(--color-text-muted)] truncate">{user?.email || ''}</p>
                    </div>
                    <div className="p-1.5">
                      <Link to={ROUTES.PROFILE} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-body text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors">
                        <User className="w-4 h-4 text-[var(--color-text-muted)]" />
                        Profile
                      </Link>
                      <Link to={ROUTES.ORDERS} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-body text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors">
                        <ShoppingBag className="w-4 h-4 text-[var(--color-text-muted)]" />
                        Orders
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-body text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className="hidden md:inline-flex items-center gap-2 text-xs font-body font-semibold uppercase tracking-[0.06em] text-[rgba(240,235,224,0.7)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-white/5 px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <SearchOverlay isOpen={true} onClose={() => setIsMobileSearchOpen(false)} />
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 z-40 bg-[var(--color-bg-overlay)] backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--color-bg-inverse)] shadow-[var(--shadow-xl)] overflow-y-auto mobile-menu-container" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[rgba(240,235,224,0.08)] flex items-center justify-between">
              <span className="font-display text-lg font-bold text-[var(--color-text-inverse)]">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[rgba(240,235,224,0.6)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <Link
                to={ROUTES.PRODUCTS}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-body font-medium text-[rgba(240,235,224,0.75)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-lg)] px-4 py-3 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop All
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-body font-medium text-[rgba(240,235,224,0.75)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-lg)] px-4 py-3 transition-colors"
              >
                <Search className="w-4 h-4" />
                Categories
              </Link>
              <Link
                to={ROUTES.ABOUT}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-body font-medium text-[rgba(240,235,224,0.75)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-lg)] px-4 py-3 transition-colors"
              >
                About
              </Link>
              <div className="border-t border-[rgba(240,235,224,0.06)] my-2" />
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-sm font-body font-medium text-[rgba(240,235,224,0.75)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-lg)] px-4 py-3 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <div className="border-t border-[rgba(240,235,224,0.06)] my-2" />
              {isAuthenticated ? (
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-body font-medium text-[rgba(240,235,224,0.75)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-lg)] px-4 py-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/80 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <div className="text-[rgba(240,235,224,0.75)]">My Account</div>
                    <div className="text-[10px] text-[rgba(240,235,224,0.4)]">{user?.email}</div>
                  </div>
                </Link>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-body font-medium text-[rgba(240,235,224,0.75)] hover:text-[var(--color-primary)] hover:bg-white/5 rounded-[var(--radius-lg)] px-4 py-3 transition-colors"
                >
                  <User className="w-5 h-5" />
                  Sign In
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
