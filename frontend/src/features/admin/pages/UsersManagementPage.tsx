import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { UserTableRow } from '../components/UserTableRow';
import { useGetAdminUsersQuery } from '../api/adminApi';
import { Pagination } from '../../../components/common/Pagination';

const roleFilterOptions = [
  { value: '', label: 'All Roles' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ADMIN', label: 'Admins' },
];

const verificationFilterOptions = [
  { value: '', label: 'All' },
  { value: 'verified', label: 'Verified Only' },
  { value: 'unverified', label: 'Unverified Only' },
];

const statusFilterOptions = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
];

export const UsersManagementPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, verificationFilter, statusFilter]);

  // Statistics
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.is_verified).length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;
  const staffUsers = users.filter(u => u.role === 'STAFF').length;
  const customerUsers = users.filter(u => u.role === 'CUSTOMER').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 mt-1">Manage customer and staff accounts</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{verifiedUsers}</p>
            <p className="text-sm text-gray-500">Verified</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{activeUsers}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{adminUsers}</p>
            <p className="text-sm text-gray-500">Admins</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{staffUsers}</p>
            <p className="text-sm text-gray-500">Staff</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-600">{customerUsers}</p>
            <p className="text-sm text-gray-500">Customers</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            {roleFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Verification Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="input-field"
          >
            {verificationFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Login</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Verification</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="animate-pulse">Loading users...</div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onRefresh={refetch}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};