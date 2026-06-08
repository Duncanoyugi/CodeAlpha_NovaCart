import React, { useState } from 'react';
import { Eye, Edit2, CheckCircle, XCircle, Shield } from 'lucide-react';
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
      case 'ADMIN': return 'bg-[var(--color-gold-50)] text-[var(--color-gold-800)] border border-[var(--color-gold-100)]';
      case 'STAFF': return 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border border-[var(--color-info-border)]';
      default: return 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]';
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
      <tr className="hover:bg-[var(--color-bg-muted)] transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
              <span className="font-ui text-xs font-bold text-[var(--color-text-secondary)]">{user.full_name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-ui text-sm font-medium text-[var(--color-text-primary)]">{user.full_name}</p>
              <p className="font-ui text-[11px] text-[var(--color-text-tertiary)]">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-ui text-[11px] font-medium tracking-wider ${getRoleBadge(user.role)}`}>
            <Shield className="w-3 h-3" />
            {user.role}
          </span>
        </td>
        <td className="py-3 px-4 font-ui text-sm text-[var(--color-text-tertiary)]">{formatDate(user.created_at, 'MMM dd, yyyy')}</td>
        <td className="py-3 px-4">
          {user.is_verified ? (
            <span className="inline-flex items-center gap-1 text-[var(--color-success-text)]">
              <CheckCircle className="w-4 h-4" />
              <span className="font-ui text-xs">Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[var(--color-warning-text)]">
              <XCircle className="w-4 h-4" />
              <span className="font-ui text-xs">Unverified</span>
            </span>
          )}
        </td>
        <td className="py-3 px-4">
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`px-3 py-1.5 rounded-full font-ui text-[11px] font-medium tracking-wider transition-colors ${
              user.is_active
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] hover:border-[var(--color-danger-border)]'
                : 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)] hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success-text)] hover:border-[var(--color-success-border)]'
            }`}
          >
            {user.is_active ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(true)} className="!p-2"><Eye className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setShowRoleModal(true)} className="!p-2"><Edit2 className="w-4 h-4" /></Button>
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
