import React from 'react';
import toast from 'react-hot-toast';
import { useGetAdminUsersQuery, useToggleUserStatusMutation, useUpdateUserRoleMutation, useVerifyUserMutation } from '../api/adminApi';
import { PageTitle, Pager, SearchInput, TableShell, Td, Th } from '../components/AdminBits';
import { Badge, Skeleton } from '../../../components/ui';
import { useAppSelector } from '../../../redux/hooks';

export const UsersManagementPage: React.FC = () => {
  const me = useAppSelector((s) => s.auth.user);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [role, setRole] = React.useState('');
  const { data, isLoading, isFetching } = useGetAdminUsersQuery({ page, page_size: 20, search: search || undefined, role: role || undefined });
  const [changeRole] = useUpdateUserRoleMutation();
  const [toggle] = useToggleUserStatusMutation();
  const [verify] = useVerifyUserMutation();
  const onSearch = React.useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const run = async (p: Promise<unknown>, ok: string) => { try { await p; toast.success(ok); } catch (e) { toast.error((e as { message?: string }).message ?? 'Action failed'); } };

  return (
    <div>
      <PageTitle title="Customers" subtitle="Manage accounts, roles and access." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <SearchInput value={search} onChange={onSearch} placeholder="Search name or email…" />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Role" className="h-11 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium"><option value="">All roles</option><option value="CUSTOMER">Customers</option><option value="STAFF">Staff</option><option value="ADMIN">Admins</option></select>
      </div>
      {isLoading ? <Skeleton className="h-96" /> : (
        <div className={isFetching ? 'opacity-70' : ''}>
          <TableShell>
            <thead><tr><Th>User</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th /></tr></thead>
            <tbody>
              {data?.users.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id}>
                    <Td><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{u.full_name?.[0]?.toUpperCase()}</span><div><p className="font-semibold">{u.full_name}{self && ' (you)'}</p><p className="text-xs text-ink-500">{u.email}</p></div></div></Td>
                    <Td><select value={u.role} disabled={self} aria-label={`Role for ${u.full_name}`} onChange={(e) => run(changeRole({ userId: u.id, role: e.target.value }).unwrap(), 'Role updated')} className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm disabled:opacity-60"><option value="CUSTOMER">Customer</option><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select></Td>
                    <Td><div className="flex flex-wrap gap-1.5">{u.is_active ? <Badge tone="brand">Active</Badge> : <Badge tone="danger">Disabled</Badge>}{u.is_verified ? <Badge>Verified</Badge> : <Badge tone="warning">Unverified</Badge>}</div></Td>
                    <Td className="whitespace-nowrap text-ink-500">{new Date(u.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</Td>
                    <Td className="whitespace-nowrap text-right">
                      {!u.is_verified && <button onClick={() => run(verify({ userId: u.id, is_verified: true }).unwrap(), 'User verified')} className="mr-2 text-xs font-bold text-brand-700 hover:underline">Verify</button>}
                      {!self && <button onClick={() => run(toggle({ userId: u.id, is_active: !u.is_active }).unwrap(), u.is_active ? 'Account disabled' : 'Account enabled')} className={`text-xs font-bold hover:underline ${u.is_active ? 'text-red-600' : 'text-brand-700'}`}>{u.is_active ? 'Disable' : 'Enable'}</button>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
          <Pager page={page} totalPages={data?.pagination?.total_pages ?? 1} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;
