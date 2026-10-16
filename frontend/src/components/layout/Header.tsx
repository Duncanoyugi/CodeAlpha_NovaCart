import React from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, LogOut, Menu, Package, Search, ShieldCheck, ShoppingBag, User as UserIcon, X, ChevronDown, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { useCart } from '../../features/cart/hooks/useCart';
import { useGetCategoryTreeQuery } from '../../redux/api/storeApi';
import { ROUTES } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';
import { cn } from '../ui';
import { categoryIcon } from './categoryIcons';
import { MobileMenu } from './MobileMenu';

export const Logo: React.FC<{ light?: boolean }> = ({ light }) => (
  <Link to={ROUTES.HOME} className="flex items-center gap-2.5" aria-label="NovaCart home">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 font-display text-xl font-extrabold text-white shadow-brand">N</span>
    <span className={cn('font-display text-xl font-extrabold tracking-tight', light ? 'text-white' : 'text-ink-900')}>
      Nova<span className="text-brand-600">Cart</span>
    </span>
  </Link>
);

const SearchBox: React.FC<{ className?: string; autoFocus?: boolean; onDone?: () => void }> = ({ className, autoFocus, onDone }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = React.useState(params.get('search') ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `${ROUTES.PRODUCTS}?search=${encodeURIComponent(q)}` : ROUTES.PRODUCTS);
    onDone?.();
  };

  return (
    <form onSubmit={submit} role="search" className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        type="search"
        placeholder="Search chargers, earbuds, power banks…"
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-transparent bg-ink-100 pl-11 pr-24 text-sm placeholder:text-ink-500 transition focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
      />
      <button type="submit" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-brand-700 px-4 text-xs font-bold text-white hover:bg-brand-800">
        Search
      </button>
    </form>
  );
};

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { totalItems, openDrawer, freeShippingThreshold } = useCart();
  const { data: categories = [] } = useGetCategoryTreeQuery();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setAccountOpen(false);
    await dispatch(logout());
    navigate(ROUTES.HOME);
  };

  const storefrontCategories = categories.filter((c) => c.slug !== 'brands').slice(0, 7);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <>
      <div className="bg-brand-900 text-brand-50">
        <div className="container-page flex h-9 items-center justify-center gap-6 text-xs font-medium sm:justify-between">
          <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-accent-300" /> Free delivery on orders over {formatPrice(freeShippingThreshold)}</p>
          <p className="hidden items-center gap-2 sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-accent-300" /> Pay securely with M-Pesa or card</p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-lg">
        <div className="container-page flex h-16 items-center gap-3 lg:gap-6">
          <button onClick={() => setMenuOpen(true)} className="-ml-2 rounded-xl p-2 text-ink-700 hover:bg-ink-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <Logo />

          <SearchBox className="mx-4 hidden max-w-xl flex-1 lg:block" />

          <nav className="ml-auto flex items-center gap-1" aria-label="Account and cart">
            <button onClick={() => setSearchOpen((v) => !v)} className="rounded-xl p-2.5 text-ink-700 hover:bg-ink-100 lg:hidden" aria-label="Search">
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            <Link to={ROUTES.WISHLIST} className="relative hidden rounded-xl p-2.5 text-ink-700 hover:bg-ink-100 sm:block" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 hover:bg-ink-100" aria-haspopup="menu" aria-expanded={accountOpen}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <span className="hidden max-w-24 truncate text-sm font-semibold md:block">{user?.full_name?.split(' ')[0]}</span>
                  <ChevronDown className="hidden h-4 w-4 text-ink-500 md:block" />
                </button>
                {accountOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-lift">
                    <div className="border-b border-ink-100 px-3 py-2.5">
                      <p className="truncate text-sm font-bold">{user?.full_name}</p>
                      <p className="truncate text-xs text-ink-500">{user?.email}</p>
                    </div>
                    {[
                      { to: ROUTES.PROFILE, label: 'My account', icon: UserIcon },
                      { to: ROUTES.ORDERS, label: 'My orders', icon: Package },
                      { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart },
                    ].map(({ to, label, icon: Icon }) => (
                      <Link key={to} to={to} onClick={() => setAccountOpen(false)} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                        <Icon className="h-4 w-4 text-ink-400" /> {label}
                      </Link>
                    ))}
                    {isStaff && (
                      <Link to={ROUTES.ADMIN_DASHBOARD} onClick={() => setAccountOpen(false)} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
                        <ShieldCheck className="h-4 w-4" /> Admin dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} role="menuitem" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 sm:block">Log in</Link>
                <Link to={ROUTES.REGISTER} className="hidden rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 sm:block">Sign up</Link>
              </>
            )}

            <button onClick={openDrawer} className="relative ml-1 rounded-xl bg-brand-50 p-2.5 text-brand-800 hover:bg-brand-100" aria-label={`Open cart, ${totalItems} items`}>
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-[11px] font-extrabold text-ink-900 ring-2 ring-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>

        {searchOpen && (
          <div className="container-page pb-3 lg:hidden">
            <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}

        {storefrontCategories.length > 0 && (
          <div className="hidden border-t border-ink-100 lg:block">
            <div className="container-page flex h-11 items-center gap-1 overflow-x-auto scrollbar-none">
              <NavLink to={ROUTES.PRODUCTS} end className={({ isActive }) => cn('flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold', isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900')}>
                All products
              </NavLink>
              {storefrontCategories.map((c) => (
                <NavLink key={c.id} to={ROUTES.CATEGORY(c.slug)} className={({ isActive }) => cn('flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold', isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900')}>
                  {categoryIcon(c.slug, 'h-4 w-4 text-brand-600')} {c.name}
                </NavLink>
              ))}
              <NavLink to={`${ROUTES.PRODUCTS}?on_sale=true`} className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold text-accent-600 hover:bg-accent-50">Deals 🔥</NavLink>
            </div>
          </div>
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={storefrontCategories} />
    </>
  );
};
