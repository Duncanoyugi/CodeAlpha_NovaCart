import React from 'react';
import { Search, Users, ChevronDown } from 'lucide-react';
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
        <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Management
        </span>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] tracking-tight mt-1">
          Customers
        </h1>
        <p className="font-ui text-sm text-[var(--color-text-secondary)] mt-1">
          Manage customer and staff accounts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] pl-11 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 appearance-none transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admins</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 appearance-none transition-all cursor-pointer"
          >
            <option value="">All</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 appearance-none transition-all cursor-pointer"
          >
            <option value="">All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[var(--color-bg-raised)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-light)]">
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">User</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Role</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Joined</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Status</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Verification</th>
                <th className="text-left py-3.5 px-4 font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-[var(--color-bg-muted)] rounded-[var(--radius-lg)] animate-pulse" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-muted)] mb-3">
                        <Users className="w-6 h-6 text-[var(--color-text-muted)]" />
                      </div>
                      <p className="font-ui text-sm text-[var(--color-text-muted)]">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => <UserTableRow key={user.id} user={user} onRefresh={refetch} />)
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-5 border-t border-[var(--color-border-light)] bg-[var(--color-bg-surface)]">
            <Pagination currentPage={page} totalPages={pagination.total_pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};
