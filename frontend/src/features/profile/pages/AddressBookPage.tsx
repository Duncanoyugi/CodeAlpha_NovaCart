import React from 'react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAddressMutation, useDeleteAddressMutation, useGetAddressesQuery, useUpdateAddressMutation } from '../api/userApi';
import { AccountShell } from '../components/AccountShell';
import { Badge, Button, Card, EmptyState, Input, Modal, Select, Skeleton } from '../../../components/ui';
import { KENYA_COUNTIES } from '../../../utils/kenya';
import type { UserAddress } from '../../../types';

const schema = z.object({
  address_line1: z.string().trim().min(3, 'Enter a street address'),
  address_line2: z.string().optional(),
  city: z.string().trim().min(2, 'Enter your town / city'),
  state: z.string().min(1, 'Select a county'),
  postal_code: z.string().trim().min(1, 'Enter a postal code'),
  is_default: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

const AddressForm: React.FC<{ initial?: UserAddress; onClose: () => void }> = ({ initial, onClose }) => {
  const [create, { isLoading: creating }] = useCreateAddressMutation();
  const [update, { isLoading: updating }] = useUpdateAddressMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { address_line1: initial?.address_line1 ?? '', address_line2: initial?.address_line2 ?? '', city: initial?.city ?? '', state: initial?.state ?? 'Nairobi', postal_code: initial?.postal_code ?? '00100', is_default: initial?.is_default ?? false },
  });
  const onSubmit = async (v: Values) => {
    const body = { ...v, address_line2: v.address_line2 ?? '', is_default: !!v.is_default, country: 'Kenya', address_type: 'shipping' as const };
    try {
      if (initial) await update({ id: initial.id, ...body }).unwrap(); else await create(body).unwrap();
      toast.success(initial ? 'Address updated' : 'Address saved');
      onClose();
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not save the address');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Street address / building" {...register('address_line1')} error={errors.address_line1?.message} />
      <Input label="Apartment / landmark (optional)" {...register('address_line2')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Town / city" {...register('city')} error={errors.city?.message} />
        <Select label="County" {...register('state')} error={errors.state?.message}>{KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}</Select>
      </div>
      <Input label="Postal code" {...register('postal_code')} error={errors.postal_code?.message} />
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...register('is_default')} className="h-4 w-4 accent-[#0b5d46]" /> Make this my default address</label>
      <Button type="submit" block loading={creating || updating}>{initial ? 'Save changes' : 'Save address'}</Button>
    </form>
  );
};

export const AddressBookPage: React.FC = () => {
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [remove] = useDeleteAddressMutation();
  const [editing, setEditing] = React.useState<UserAddress | 'new' | null>(null);

  const del = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try { await remove(id).unwrap(); toast.success('Address deleted'); } catch { toast.error('Could not delete the address'); }
  };

  return (
    <AccountShell title="Address book" subtitle="Save places you ship to often." action={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>Add address</Button>}>
      {isLoading ? <Skeleton className="h-40 w-full" /> : !addresses?.length ? (
        <EmptyState icon={<MapPin className="h-9 w-9" />} title="No saved addresses" description="Add an address to speed up checkout." action={<Button onClick={() => setEditing('new')}>Add address</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="mb-2 flex items-center justify-between">{a.is_default ? <Badge tone="brand"><Star className="h-3 w-3" /> Default</Badge> : <span />}
                <div className="flex gap-1"><button onClick={() => setEditing(a)} aria-label="Edit address" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"><Pencil className="h-4 w-4" /></button><button onClick={() => del(a.id)} aria-label="Delete address" className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
              </div>
              <address className="text-sm not-italic leading-relaxed text-ink-600">{a.address_line1}{a.address_line2 && `, ${a.address_line2}`}<br />{a.city}, {a.state} {a.postal_code}<br />{a.country}</address>
            </Card>
          ))}
        </div>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add address' : 'Edit address'}>
        {editing !== null && <AddressForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      </Modal>
    </AccountShell>
  );
};

export default AddressBookPage;
