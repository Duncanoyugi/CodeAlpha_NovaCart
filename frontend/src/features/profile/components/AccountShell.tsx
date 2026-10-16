import React from 'react';
import { NavLink } from 'react-router-dom';
import { KeyRound, MapPin, Package, Heart, User as UserIcon } from 'lucide-react';
import { useAppSelector } from '../../../redux/hooks';
import { ROUTES } from '../../../utils/constants';
import { cn } from '../../../components/ui';

const links = [
  { to: ROUTES.PROFILE, label: 'Overview', icon: UserIcon, end: true },
  { to: ROUTES.ORDERS, label: 'My orders', icon: Package },
  { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart },
  { to: ROUTES.ADDRESS_BOOK, label: 'Addresses', icon: MapPin },
  { to: ROUTES.CHANGE_PASSWORD, label: 'Password', icon: KeyRound },
];

export const AccountShell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, subtitle, children, action }) => {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">{user?.full_name?.[0]?.toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate font-bold">{user?.full_name}</p><p className="truncate text-xs text-ink-500">{user?.email}</p></div>
          </div>
          <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 shadow-soft scrollbar-none lg:flex-col" aria-label="Account">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition', isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50')}>
                <Icon className="h-4.5 w-4.5" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <div className="mb-6 flex items-start justify-between gap-3">
            <div><h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}</div>
            {action}
          </div>
          {children}
        </section>
      </div>
    </div>
  );
};
