import React from 'react';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from '../api/adminApi';
import { PageTitle, Pager, SearchInput, TableShell, Td, Th } from '../components/AdminBits';
import { OrderStatusBadge, PaymentStatusBadge } from '../../orders/components/StatusBadge';
import { Button, Input, Modal, Select, Skeleton, Textarea } from '../../../components/ui';
import { formatPrice } from '../../../utils/formatPrice';
import type { Order } from '../../../types';

// Mirrors the server's state machine (orders/services/order_service.py).
const NEXT: Record<string, Array<{ value: string; label: string }>> = {
  pending: [{ value: 'cancelled', label: 'Cancel order' }],
  processing: [{ value: 'confirmed', label: 'Confirm' }, { value: 'shipped', label: 'Mark as shipped' }, { value: 'cancelled', label: 'Cancel & release stock' }],
  confirmed: [{ value: 'shipped', label: 'Mark as shipped' }, { value: 'cancelled', label: 'Cancel & release stock' }],
  shipped: [{ value: 'delivered', label: 'Mark as delivered' }],
  delivered: [],
  cancelled: [],
  refunded: [],
};

type AdminOrder = Order & { customer?: { email: string; full_name: string }; admin_notes?: string };

export const OrdersManagementPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [payment, setPayment] = React.useState('');
  const [selected, setSelected] = React.useState<AdminOrder | null>(null);
  const [nextStatus, setNextStatus] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [tracking, setTracking] = React.useState('');
  const [carrier, setCarrier] = React.useState('');
  const { data, isLoading, isFetching } = useGetAdminOrdersQuery({ page, page_size: 20, search: search || undefined, status: status || undefined, payment_status: payment || undefined });
  const [updateStatus, { isLoading: saving }] = useUpdateOrderStatusMutation();
  const orders = (data?.orders ?? []) as AdminOrder[];
  const onSearch = React.useCallback((v: string) => { setSearch(v); setPage(1); }, []);

  const open = (o: AdminOrder) => { setSelected(o); setNextStatus(''); setNotes(''); setTracking(o.tracking_number ?? ''); setCarrier(o.carrier ?? ''); };

  const save = async () => {
    if (!selected || !nextStatus) return;
    try {
      await updateStatus({ orderId: selected.id, status: nextStatus, admin_notes: notes || undefined, tracking_number: tracking || undefined, carrier: carrier || undefined }).unwrap();
      toast.success('Order updated');
      setSelected(null);
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not update the order');
    }
  };

  return (
    <div>
      <PageTitle title="Orders" subtitle="Track payments and move orders through fulfilment." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <SearchInput value={search} onChange={onSearch} placeholder="Search order #, customer name or email…" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Order status" className="h-11 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium">
          <option value="">All statuses</option>{['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }} aria-label="Payment status" className="h-11 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium">
          <option value="">All payments</option>{['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <Skeleton className="h-96 w-full" /> : (
        <div className={isFetching ? 'opacity-70 transition' : 'transition'}>
          <TableShell>
            <thead><tr><Th>Order</Th><Th>Customer</Th><Th>Date</Th><Th>Status</Th><Th>Payment</Th><Th className="text-right">Total</Th><Th /></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ink-50/60">
                  <Td className="font-bold">{o.order_number}</Td>
                  <Td><p className="font-semibold">{o.shipping_full_name}</p><p className="text-xs text-ink-500">{o.customer?.email ?? o.shipping_email}</p></Td>
                  <Td className="whitespace-nowrap text-ink-500">{new Date(o.placed_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</Td>
                  <Td><OrderStatusBadge status={o.status} /></Td>
                  <Td><PaymentStatusBadge status={o.payment_status} /></Td>
                  <Td className="text-right font-bold">{formatPrice(o.total_amount)}</Td>
                  <Td className="text-right"><Button size="sm" variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => open(o)}>Manage</Button></Td>
                </tr>
              ))}
              {orders.length === 0 && <tr><Td colSpan={7} className="py-12 text-center text-ink-500">No orders match your filters</Td></tr>}
            </tbody>
          </TableShell>
          <Pager page={page} totalPages={data?.pagination?.total_pages ?? 1} onChange={setPage} />
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Order ${selected.order_number}` : ''} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><OrderStatusBadge status={selected.status} /><PaymentStatusBadge status={selected.payment_status} /></div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-ink-50 p-4"><p className="font-bold">Deliver to</p><p className="mt-1 text-ink-600">{selected.shipping_full_name}<br />{selected.shipping_address_line1}, {selected.shipping_city}<br />{selected.shipping_state} · {selected.shipping_phone}</p></div>
              <div className="rounded-xl bg-ink-50 p-4"><p className="font-bold">Payment</p><p className="mt-1 text-ink-600">{formatPrice(selected.total_amount)} via {selected.payment_method ?? '—'}{selected.latest_payment?.receipt_number && <><br />Receipt {selected.latest_payment.receipt_number}</>}</p></div>
            </div>
            <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 text-sm">
              {selected.items.map((i) => <li key={i.id} className="flex justify-between gap-3 px-4 py-2.5"><span>{i.quantity} × {i.product_name}</span><b>{formatPrice(i.total_price)}</b></li>)}
            </ul>
            {selected.admin_notes && <pre className="whitespace-pre-wrap rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{selected.admin_notes}</pre>}

            {(NEXT[selected.status] ?? []).length > 0 ? (
              <div className="space-y-3 border-t border-ink-100 pt-5">
                <Select label="Next step" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                  <option value="">Choose an action…</option>
                  {NEXT[selected.status].map((n) => <option key={n.value} value={n.value} disabled={n.value !== 'cancelled' && selected.payment_status !== 'paid'}>{n.label}{n.value !== 'cancelled' && selected.payment_status !== 'paid' ? ' (needs payment)' : ''}</option>)}
                </Select>
                {nextStatus === 'shipped' && <div className="grid gap-3 sm:grid-cols-2"><Input label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} /><Input label="Courier" value={carrier} onChange={(e) => setCarrier(e.target.value)} /></div>}
                {nextStatus && <Textarea label="Internal note (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />}
                <Button block loading={saving} disabled={!nextStatus} variant={nextStatus === 'cancelled' ? 'danger' : 'primary'} onClick={save}>Apply</Button>
              </div>
            ) : <p className="border-t border-ink-100 pt-4 text-sm text-ink-500">No further actions — this order is {selected.status}.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagementPage;
