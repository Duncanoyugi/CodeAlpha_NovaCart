import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { BatteryCharging, Headphones, ShieldCheck, Truck } from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import { ROUTES } from '../utils/constants';
import { Logo } from '../components/layout/Header';
import { FullPageLoader } from '../components/ui';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  if (isInitializing) return <FullPageLoader />;
  if (isAuthenticated && location.pathname !== ROUTES.VERIFY_OTP) return <Navigate to={from || ROUTES.HOME} replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-700/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <Logo light />
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-white">Gadgets you’ll actually love, at your door in days.</h2>
          <p className="mt-4 text-brand-100/80">Join thousands of Kenyans shopping chargers, earbuds and power banks with M-Pesa checkout.</p>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              { icon: Truck, text: 'Free delivery on orders over KES 5,000' },
              { icon: ShieldCheck, text: 'Pay safely with M-Pesa or your card' },
              { icon: BatteryCharging, text: 'Genuine products with real warranty' },
              { icon: Headphones, text: 'Friendly local support' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent-300"><Icon className="h-4.5 w-4.5" /></span>{text}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200/60">© {new Date().getFullYear()} NovaCart</p>
      </aside>

      <main className="flex flex-col bg-white">
        <div className="flex items-center justify-between p-5 lg:hidden"><Logo /></div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md"><Outlet /></div>
        </div>
        <p className="p-5 text-center text-xs text-ink-400"><Link to={ROUTES.HOME} className="hover:text-brand-700">← Back to store</Link></p>
      </main>
    </div>
  );
};

export default AuthLayout;
