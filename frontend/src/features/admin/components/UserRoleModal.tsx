import React, { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { useUpdateUserRoleMutation } from '../api/adminApi';
import { ROLE_OPTIONS } from '../../../types/admin.types';
import toast from 'react-hot-toast';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentRole: string;
  userName: string;
  onSuccess: () => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentRole,
  userName,
  onSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [updateRole, { isLoading }] = useUpdateUserRoleMutation();

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }

    try {
      await updateRole({ userId, role: selectedRole }).unwrap();
      toast.success(`User role updated to ${selectedRole}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (!isOpen) return null;

  const isAdminChange = selectedRole === 'ADMIN' || currentRole === 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Change User Role</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600">
            Update role for <span className="font-semibold">{userName}</span>
          </p>

          {/* Role Options */}
          <div className="space-y-3">
            {ROLE_OPTIONS.map((role) => (
              <label
                key={role.value}
                className={`
                  flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition
                  ${selectedRole === role.value 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.label}</span>
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${role.color}`}>
                      {role.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Warning for Admin Role */}
          {isAdminChange && selectedRole === 'ADMIN' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Granting admin access gives full system control. Please confirm this change.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
};