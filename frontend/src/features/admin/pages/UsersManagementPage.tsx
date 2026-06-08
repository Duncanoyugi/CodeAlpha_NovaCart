import React from 'react';
import { Search, Users } from 'lucide-react';
import { UserTableRow } from '../components/UserTableRow';
import { useGetAdminUsersQuery } from '../api/adminApi';
import { Pagination } from '../../../components/common/Pagination';

export const UsersManagementPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [verificationFilter, setVerificationFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const { data, isLoading, refetch } = useGetAdminUsersQuery({
    page,
    page_size: 20,
    search: search || undefined,
    role: roleFilter || undefined,
    is_verified: verificationFilter === 'verified' ? true : verificationFilter === 'unverified' ? false : undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  React.useEffect(() => { setPage(1); }, [search, roleFilter, verificationFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Management</span>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mt-2">Users</h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">Manage customer and staff accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none">
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none">
          <option value="">All</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none">
          <option value="">All</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-bg-muted)]">
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">User</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Role</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Joined</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Status</th>
                <th className="text-left py-3 px-4 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="animate-pulse space-y-3"><div className="h-4 skeleton w-3/4 mx-auto" /><div className="h-4 skeleton w-1/2 mx-auto" /></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center"><Users className="w-12 h-12 mx-auto text-[var(--color-text-tertiary)] mb-3" /><p className="font-ui text-sm text-[var(--color-text-secondary)]">No users found</p></td></tr>
              ) : users.map((user) => <UserTableRow key={user.id} user={user} onRefresh={refetch} />)}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--color-border-light)]">
            <Pagination currentPage={page} totalPages={pagination.total_pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};