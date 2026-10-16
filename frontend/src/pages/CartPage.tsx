import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ShoppingBag, Trash2, AlertTriangle } from 'lucide-react';
import { useCart } from '../features/cart/hooks/useCart';
import { useAppSelector } from '../redux/hooks';
import { FreeShippingBar } from '../components/layout/CartDrawer';
import { Button, Card, EmptyState, QuantityStepper, Skeleton } from '../components/ui';
import { formatPrice } from '../utils/formatPrice';
import { ROUTES } from '../utils/constants';
import { ProductImage } from '../components/common/ProductImage';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, isLoading, subtotal, shippingCost, taxAmount, totalAmount, totalItems, freeShippingThreshold, updateItemQuantity, removeItemFromCart, clearAllItems, pendingItemId } = useCart();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isLoading && items.length === 0) {
    return <div className="container-page space-y-4 py-10"><Skeleton className="h-10 w-48" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>;
  }

  if (items.length === 0) {
    return <EmptyState icon={<ShoppingBag className="h-9 w-9" />} title="Your cart is empty" description="Add a few things you love and they’ll show up here." action={<Link to={ROUTES.PRODUCTS}><Button size="lg">Start shopping</Button></Link>} />;
  }

  const proceed = () => navigate(isAuthenticated ? ROUTES.CHECKOUT : ROUTES.LOGIN, { state: { from: { pathname: ROUTES.CHECKOUT } } });
  const hasProblem = items.some((i) => (i.available_stock ?? 99) < i.quantity || (i.available_stock ?? 1) === 0);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-extrabold">Shopping cart <span className="text-xl font-semibold text-ink-400">({totalItems})</span></h1>
        <button onClick={() => clearAllItems()} className="text-sm font-semibold text-ink-500 hover:text-red-600">Clear cart</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />
          {items.map((item) => {
            const stock = item.available_stock ?? 99;
            const busy = pendingItemId === item.id;
            return (
              <Card key={item.id} className={`flex gap-4 p-4 transition ${busy ? 'opacity-60' : ''}`}>
                <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-28 sm:w-28">
                  <ProductImage product={item.product} alt={item.product.name} className="h-full w-full object-cover" loading="lazy" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={ROUTES.PRODUCT_DETAIL(item.product.slug)} className="line-clamp-2 font-semibold leading-snug hover:text-brand-700">{item.product.name}</Link>
                      {item.variant && <p className="mt-0.5 text-xs text-ink-500">{item.variant.name}</p>}
                      <p className="mt-1 text-sm text-ink-500">{formatPrice(item.current_price)} each</p>
                    </div>
                    <button onClick={() => removeItemFromCart(item.id)} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${item.product.name}`}><Trash2 className="h-4.5 w-4.5" /></button>
                  </div>
                  {item.price_changed && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-600"><AlertTriangle className="h-3.5 w-3.5" /> Price updated since you added this</p>}
                  {stock < item.quantity && <p className="mt-1 text-xs font-semibold text-red-600">{stock === 0 ? 'Now out of stock — remove it to continue' : `Only ${stock} left — reduce the quantity`}</p>}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper value={item.quantity} max={Math.max(stock, 1)} disabled={busy} onChange={(n) => updateItemQuantity(item.id, n)} />
                    <p className="text-lg font-extrabold">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
          <Link to={ROUTES.PRODUCTS} className="inline-block pt-2 text-sm font-semibold text-brand-700 hover:underline">← Continue shopping</Link>
        </div>

        <aside>
          <Card className="sticky top-32 p-6">
            <h2 className="text-lg font-bold">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd className="font-semibold">{shippingCost === 0 ? <span className="text-brand-700">Free</span> : formatPrice(shippingCost)}</dd></div>
              <div className="flex justify-between text-xs"><dt className="text-ink-400">Includes VAT (16%)</dt><dd className="text-ink-500">{formatPrice(taxAmount)}</dd></div>
              <div className="flex justify-between border-t border-ink-100 pt-4 text-base"><dt className="font-bold">Total</dt><dd className="text-xl font-extrabold">{formatPrice(totalAmount)}</dd></div>
            </dl>
            <Button block size="lg" className="mt-6" disabled={hasProblem} onClick={proceed} rightIcon={<ArrowRight className="h-5 w-5" />}>
              {isAuthenticated ? 'Proceed to checkout' : 'Log in to checkout'}
            </Button>
            {!isAuthenticated && <p className="mt-3 text-center text-xs text-ink-500">Your cart is saved — it will be waiting after you log in.</p>}
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500"><ShieldCheck className="h-4 w-4 text-brand-600" /> Secure checkout · M-Pesa & cards</p>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
