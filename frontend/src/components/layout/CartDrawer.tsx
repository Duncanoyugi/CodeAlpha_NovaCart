import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, X, Truck } from 'lucide-react';
import { useCart } from '../../features/cart/hooks/useCart';
import { useAppSelector } from '../../redux/hooks';
import { formatPrice } from '../../utils/formatPrice';
import { ProductImage } from '../common/ProductImage';
import { ROUTES } from '../../utils/constants';
import { Button, QuantityStepper } from '../ui';

export const FreeShippingBar: React.FC<{ subtotal: number; threshold: number }> = ({ subtotal, threshold }) => {
  const remaining = Math.max(threshold - subtotal, 0);
  const pct = Math.min((subtotal / threshold) * 100, 100);
  return (
    <div className="rounded-xl bg-brand-50 p-3.5">
      <p className="flex items-center gap-2 text-xs font-semibold text-brand-900">
        <Truck className="h-4 w-4" />
        {remaining === 0 ? 'You’ve unlocked free delivery 🎉' : <>Add <b>{formatPrice(remaining)}</b> more for free delivery</>}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { items, drawerOpen, closeDrawer, subtotal, totalItems, updateItemQuantity, removeItemFromCart, pendingItemId, freeShippingThreshold } = useCart();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  const checkout = () => {
    closeDrawer();
    navigate(isAuthenticated ? ROUTES.CHECKOUT : `${ROUTES.LOGIN}`, { state: { from: { pathname: ROUTES.CHECKOUT } } });
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <motion.div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} />
          <motion.aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-lift" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="text-lg font-bold">Your cart <span className="text-ink-400">({totalItems})</span></h2>
              <button onClick={closeDrawer} className="rounded-full p-2 hover:bg-ink-100" aria-label="Close cart"><X className="h-5 w-5" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-700"><ShoppingBag className="h-9 w-9" /></div>
                <p className="text-lg font-bold">Your cart is empty</p>
                <p className="mt-1 text-sm text-ink-500">Find something you’ll love.</p>
                <Link to={ROUTES.PRODUCTS} onClick={closeDrawer} className="mt-6"><Button>Start shopping</Button></Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} onClick={closeDrawer} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                        <ProductImage product={item.product} alt={item.product.name} className="h-full w-full object-cover" loading="lazy" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} onClick={closeDrawer} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-brand-700">{item.product.name}</Link>
                        {item.variant && <p className="text-xs text-ink-500">{item.variant.name}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <QuantityStepper size="sm" value={item.quantity} max={item.available_stock ?? 99} disabled={pendingItemId === item.id} onChange={(n) => updateItemQuantity(item.id, n)} />
                          <p className="text-sm font-bold">{formatPrice(item.subtotal)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeItemFromCart(item.id)} className="self-start rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${item.product.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-ink-100 p-5">
                  <div className="flex items-center justify-between text-sm"><span className="text-ink-500">Subtotal</span><span className="text-lg font-extrabold">{formatPrice(subtotal)}</span></div>
                  <p className="text-xs text-ink-500">Delivery and VAT are calculated at checkout.</p>
                  <Button block size="lg" onClick={checkout}>Checkout</Button>
                  <Link to={ROUTES.CART} onClick={closeDrawer} className="block text-center text-sm font-semibold text-brand-700 hover:underline">View full cart</Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
