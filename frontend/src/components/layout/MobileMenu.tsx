import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LogOut, Package, ShieldCheck, User as UserIcon, X, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { ROUTES } from '../../utils/constants';
import type { Category } from '../../types';
import { categoryIcon } from './categoryIcons';

export const MobileMenu: React.FC<{ open: boolean; onClose: () => void; categories: Category[] }> = ({ open, onClose, categories }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const row = 'flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold text-ink-800 hover:bg-ink-50';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-lift" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }}>
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <p className="font-display text-lg font-extrabold">Nova<span className="text-brand-600">Cart</span></p>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-ink-100" aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {isAuthenticated ? (
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 font-bold text-white">{user?.full_name?.[0]?.toUpperCase()}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{user?.full_name}</p>
                    <p className="truncate text-xs text-ink-500">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <Link to={ROUTES.LOGIN} onClick={onClose} className="rounded-xl border border-ink-200 py-2.5 text-center text-sm font-bold">Log in</Link>
                  <Link to={ROUTES.REGISTER} onClick={onClose} className="rounded-xl bg-brand-700 py-2.5 text-center text-sm font-bold text-white">Sign up</Link>
                </div>
              )}

              <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-ink-400">Shop</p>
              <Link to={ROUTES.PRODUCTS} onClick={onClose} className={row}>All products <ChevronRight className="h-4 w-4 text-ink-400" /></Link>
              {categories.map((c) => (
                <Link key={c.id} to={ROUTES.CATEGORY(c.slug)} onClick={onClose} className={row}>
                  <span className="flex items-center gap-3">{categoryIcon(c.slug, 'h-5 w-5 text-brand-600')} {c.name}</span>
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-ink-400">Account</p>
                  <Link to={ROUTES.PROFILE} onClick={onClose} className={row}><span className="flex items-center gap-3"><UserIcon className="h-5 w-5 text-ink-400" /> My account</span></Link>
                  <Link to={ROUTES.ORDERS} onClick={onClose} className={row}><span className="flex items-center gap-3"><Package className="h-5 w-5 text-ink-400" /> My orders</span></Link>
                  <Link to={ROUTES.WISHLIST} onClick={onClose} className={row}><span className="flex items-center gap-3"><Heart className="h-5 w-5 text-ink-400" /> Wishlist</span></Link>
                  {isStaff && <Link to={ROUTES.ADMIN_DASHBOARD} onClick={onClose} className={`${row} text-brand-700`}><span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Admin dashboard</span></Link>}
                </>
              )}

              <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-ink-400">Help</p>
              <Link to={ROUTES.ABOUT} onClick={onClose} className={row}>About us</Link>
              <Link to={ROUTES.CONTACT} onClick={onClose} className={row}>Contact</Link>
            </div>

            {isAuthenticated && (
              <div className="border-t border-ink-100 p-3">
                <button
                  onClick={async () => {
                    onClose();
                    await dispatch(logout());
                    navigate(ROUTES.HOME);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
