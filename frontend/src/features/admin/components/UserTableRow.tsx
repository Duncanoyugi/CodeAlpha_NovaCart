import React, { useState } from 'react';
import { Eye, Edit2, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import type { User } from '../../../types';
import { formatDate } from '../../../utils';
import { UserRoleModal } from './UserRoleModal';
import { UserDetailModal } from './UserDetailModal';
import { useToggleUserStatusMutation } from '../api/adminApi';
import toast from 'react-hot-toast';
import { Button } from '../../../components/common/Button';

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
        return 'bg-[var(--color-gold-50)] text-[var(--color-gold-800)] border border-[var(--color-gold-100)]';
      case 'STAFF':
        return 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]';
      default:
        return 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]';
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
      <tr className="group hover:bg-[var(--color-bg-muted)] transition-colors duration-150">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center border border-[var(--color-border-light)] group-hover:border-[var(--color-border-medium)] transition-colors">
              <span className="font-ui text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
                {user.full_name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-ui text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                {user.full_name}
              </p>
              <p className="font-ui text-[11px] text-[var(--color-text-muted)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-ui text-[11px] font-semibold tracking-wide ${getRoleBadge(user.role)}`}>
            {user.role}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="font-ui text-sm text-[var(--color-text-muted)]">
            {formatDate(user.created_at, 'MMM dd, yyyy')}
          </span>
        </td>
        <td className="py-4 px-4">
          {user.is_verified ? (
            <span className="inline-flex items-center gap-1.5 text-[var(--color-success)]">
              <CheckCircle className="w-4 h-4" />
              <span className="font-ui text-xs font-medium">Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[var(--color-warning)]">
              <XCircle className="w-4 h-4" />
              <span className="font-ui text-xs font-medium">Unverified</span>
            </span>
          )}
        </td>
        <td className="py-4 px-4">
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ui text-[11px] font-semibold tracking-wide transition-all duration-150 border ${
              user.is_active
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] hover:border-[var(--color-danger-border)]'
                : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success-text)] hover:border-[var(--color-success-border)]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`} />
            {user.is_active ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailModal(true)}
              className="!p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)]"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRoleModal(true)}
              className="!p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)]"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
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
