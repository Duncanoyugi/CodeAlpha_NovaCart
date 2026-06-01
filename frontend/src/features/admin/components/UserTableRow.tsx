import React, { useState } from 'react';
import { Eye, Edit2, CheckCircle, XCircle, Shield } from 'lucide-react';
import type { User } from '../../../types';
import { formatDate } from '../../../utils';
import { UserRoleModal } from './UserRoleModal';
import { UserDetailModal } from './UserDetailModal';
import { useToggleUserStatusMutation } from '../api/adminApi';
import toast from 'react-hot-toast';

interface UserTableRowProps {
  user: User;
  onRefresh: () => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user, onRefresh }) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'STAFF':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleStatus({ userId: user.id, is_active: !user.is_active }).unwrap();
      toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-600">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.full_name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
            <Shield className="w-3 h-3" />
            {user.role}
          </span>
        </td>
        <td className="py-3 px-4 text-sm text-gray-500">
          {formatDate(user.created_at, 'MMM dd, yyyy')}
        </td>
        <td className="py-3 px-4 text-sm text-gray-500">
          {formatDate(user.last_login, 'MMM dd, yyyy')}
        </td>
        <td className="py-3 px-4">
          {user.is_verified ? (
            <span className="inline-flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-yellow-600">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">Unverified</span>
            </span>
          )}
        </td>
        <td className="py-3 px-4">
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`px-2 py-1 text-xs rounded-full transition ${
              user.is_active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {user.is_active ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetailModal(true)}
              className="p-1 text-gray-500 hover:text-primary-600 rounded transition"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRoleModal(true)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded transition"
              title="Change Role"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      <UserRoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userId={user.id}
        currentRole={user.role}
        userName={user.full_name}
        onSuccess={onRefresh}
      />

      <UserDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        user={user}
      />
    </>
  );
};