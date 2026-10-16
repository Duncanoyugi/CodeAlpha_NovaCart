import React from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Banknote, Clock, ShoppingBag, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useGetDashboardStatsQuery, useGetInventoryStatusQuery, useGetRecentOrdersQuery, useGetSalesOverviewQuery, useGetTopProductsQuery } from '../api/adminApi';
import { PageTitle, StatCard, TableShell, Td, Th } from '../components/AdminBits';
import { OrderStatusBadge, PaymentStatusBadge } from '../../orders/components/StatusBadge';
import { Card, Skeleton, cn } from '../../../components/ui';
import { formatPrice } from '../../../utils/formatPrice';
import { ROUTES } from '../../../utils/constants';

export const DashboardPage: React.FC = () => {
  const [days, setDays] = React.useState(30);
  const stats = useGetDashboardStatsQuery();
  const sales = useGetSalesOverviewQuery({ days });
  const top = useGetTopProductsQuery({ limit: 5, days });
  const recent = useGetRecentOrdersQuery({ limit: 6 });
  const inventory = useGetInventoryStatusQuery();
  const s = stats.data;

  return (
    <div>
      <PageTitle eyebrow="Overview" title="Dashboard" subtitle="How the store is performing (paid orders only)." action={
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold" aria-label="Period">
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      } />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.isLoading || !s ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />) : (
          <>
            <StatCard label="Revenue (7 days)" value={formatPrice(s.total_revenue)} icon={<Banknote className="h-5 w-5" />} hint={<span className={cn('inline-flex items-center gap-1 font-semibold', s.revenue_growth >= 0 ? 'text-brand-700' : 'text-red-600')}>{s.revenue_growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{Math.abs(s.revenue_growth).toFixed(1)}% vs previous week</span>} />
            <StatCard label="Orders (7 days)" value={String(s.total_orders)} icon={<ShoppingBag className="h-5 w-5" />} tone="info" hint={`Avg ${formatPrice(s.average_order_value)}`} />
            <StatCard label="Needs attention" value={String(s.pending_orders + s.processing_orders)} icon={<Clock className="h-5 w-5" />} tone="accent" hint={`${s.pending_orders} unpaid · ${s.processing_orders} to fulfil`} />
            <StatCard label="Customers" value={String(s.total_customers)} icon={<Users className="h-5 w-5" />} hint={`${s.new_customers} new this week`} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">Revenue</h2>
          <div className="h-72">
            {sales.isLoading ? <Skeleton className="h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.data ?? []} margin={{ left: 0, right: 8, top: 8 }}>
                  <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10a074" stopOpacity={0.35} /><stop offset="100%" stopColor="#10a074" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0ee" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tick={{ fontSize: 11, fill: '#6b766f' }} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} tick={{ fontSize: 11, fill: '#6b766f' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} labelStyle={{ fontWeight: 700 }} contentStyle={{ borderRadius: 12, border: '1px solid #eef0ee' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0b7f5c" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">Stock alerts</h2>
          {inventory.data ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['In stock', inventory.data.in_stock, 'text-brand-700'], ['Low', inventory.data.low_stock, 'text-amber-600'], ['Out', inventory.data.out_of_stock, 'text-red-600']].map(([l, v, c]) => (
                  <div key={l as string} className="rounded-xl bg-ink-50 p-3"><p className={cn('text-2xl font-extrabold', c as string)}>{v as number}</p><p className="text-xs text-ink-500">{l as string}</p></div>
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {inventory.data.needs_reorder.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm"><span className="flex min-w-0 items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" /><span className="truncate">{p.name}</span></span><b className="shrink-0 text-red-600">{p.stock_quantity} left</b></li>
                ))}
                {inventory.data.needs_reorder.length === 0 && <li className="text-sm text-ink-500">Everything is well stocked 🎉</li>}
              </ul>
            </>
          ) : <Skeleton className="h-48" />}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Recent orders</h2><Link to={ROUTES.ADMIN_ORDERS} className="text-sm font-semibold text-brand-700 hover:underline">View all</Link></div>
          <TableShell>
            <thead><tr><Th>Order</Th><Th>Status</Th><Th>Payment</Th><Th className="text-right">Total</Th></tr></thead>
            <tbody>
              {(recent.data ?? []).map((o) => (<tr key={o.id}><Td className="font-bold">{o.order_number}</Td><Td><OrderStatusBadge status={o.status} /></Td><Td><PaymentStatusBadge status={o.payment_status} /></Td><Td className="text-right font-bold">{formatPrice(o.total_amount)}</Td></tr>))}
              {recent.data?.length === 0 && <tr><Td colSpan={4} className="py-8 text-center text-ink-500">No orders yet</Td></tr>}
            </tbody>
          </TableShell>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-bold">Top products</h2>
          <TableShell>
            <thead><tr><Th>Product</Th><Th className="text-right">Sold</Th><Th className="text-right">Revenue</Th></tr></thead>
            <tbody>
              {(top.data ?? []).map((p) => (<tr key={p.id}><Td className="max-w-[260px] truncate font-semibold">{p.name}</Td><Td className="text-right">{p.total_sold}</Td><Td className="text-right font-bold">{formatPrice(p.total_revenue)}</Td></tr>))}
              {top.data?.length === 0 && <tr><Td colSpan={3} className="py-8 text-center text-ink-500">No sales in this period</Td></tr>}
            </tbody>
          </TableShell>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
