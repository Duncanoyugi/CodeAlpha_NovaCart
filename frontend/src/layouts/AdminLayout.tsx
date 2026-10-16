import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, ExternalLink, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, Users, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { ROUTES } from '../utils/constants';
import { cn } from '../components/ui';

const nav = [
  { name: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { name: 'Orders', to: ROUTES.ADMIN_ORDERS, icon: ShoppingBag },
  { name: 'Products', to: ROUTES.ADMIN_PRODUCTS, icon: Package },
  { name: 'Customers', to: ROUTES.ADMIN_USERS, icon: Users, adminOnly: true },
  { name: 'Analytics', to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
];

export const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = React.useState(false);
  const items = nav.filter((n) => !n.adminOnly || user?.role === 'ADMIN');

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-950 text-brand-100">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-display text-xl font-extrabold text-white">N</span>
        <div><p className="font-display text-base font-extrabold leading-none text-white">NovaCart</p><p className="text-[10px] font-semibold uppercase tracking-widest text-brand-300">{user?.role === 'ADMIN' ? 'Admin' : 'Staff'}</p></div>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {items.map(({ name, to, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition', isActive ? 'bg-white/10 text-white' : 'text-brand-200/80 hover:bg-white/5 hover:text-white')}>
            <Icon className="h-4.5 w-4.5" /> {name}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <NavLink to={ROUTES.HOME} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-200/80 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4.5 w-4.5" /> View store</NavLink>
        <button onClick={async () => { await dispatch(logout()); navigate(ROUTES.HOME); }} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-200/80 hover:bg-white/5 hover:text-white"><LogOut className="h-4.5 w-4.5" /> Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button className="rounded-xl p-2 hover:bg-ink-100 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right"><p className="text-sm font-bold leading-tight">{user?.full_name}</p><p className="text-xs text-ink-500">{user?.email}</p></div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{user?.full_name?.[0]?.toUpperCase()}</span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
