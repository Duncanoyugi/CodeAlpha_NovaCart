import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, KeyRound, LogOut, MapPin, Package, Pencil } from 'lucide-react';
import { useGetProfileQuery } from '../hooks/profileHooks';
import { useAppDispatch } from '../../../redux/hooks';
import { logout } from '../../../redux/slices/authSlice';
import { AccountShell } from '../components/AccountShell';
import { Badge, Button, Card, Skeleton } from '../../../components/ui';
import { ROUTES } from '../../../utils/constants';

export const ProfilePage: React.FC = () => {
  const { data: user, isLoading } = useGetProfileQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const rows: Array<[string, string | undefined]> = [
    ['Full name', user?.full_name], ['Email', user?.email], ['Phone', user?.phone_number || 'Not added'],
    ['Delivery address', [user?.address_line1, user?.city, user?.state].filter(Boolean).join(', ') || 'Not added'],
  ];

  return (
    <AccountShell title="My account" subtitle="Manage your details and see your activity." action={<Link to={ROUTES.EDIT_PROFILE}><Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>Edit</Button></Link>}>
      <Card className="p-6">
        {isLoading ? <Skeleton className="h-40 w-full" /> : (
          <dl className="divide-y divide-ink-100">
            {rows.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><dt className="text-sm text-ink-500">{k}</dt><dd className="text-sm font-semibold">{v}</dd></div>
            ))}
            <div className="flex items-center justify-between pt-3.5"><dt className="text-sm text-ink-500">Status</dt><dd>{user?.is_verified ? <Badge tone="brand">Email verified</Badge> : <Badge tone="warning">Unverified</Badge>}</dd></div>
          </dl>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[{ to: ROUTES.ORDERS, icon: Package, t: 'Orders', d: 'Track and manage' }, { to: ROUTES.ADDRESS_BOOK, icon: MapPin, t: 'Addresses', d: 'Saved places' }, { to: ROUTES.CHANGE_PASSWORD, icon: KeyRound, t: 'Security', d: 'Change password' }].map(({ to, icon: Icon, t, d }) => (
          <Link key={to} to={to} className="group flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-brand-200 hover:shadow-lift">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block font-bold">{t}</span><span className="text-xs text-ink-500">{d}</span></span>
            <ChevronRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <Button variant="ghost" className="mt-8 !text-red-600 hover:!bg-red-50" leftIcon={<LogOut className="h-4.5 w-4.5" />} onClick={async () => { await dispatch(logout()); navigate(ROUTES.HOME); }}>Log out</Button>
    </AccountShell>
  );
};

export default ProfilePage;
