import React from 'react';
import { X } from 'lucide-react';
import type { User } from '../../../types';
import { formatDate } from '../../../utils';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-gray-800">{user.full_name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-800">{user.email}</p>
          </div>
          
          {user.phone_number && (
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-800">{user.phone_number}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-800 capitalize">{user.role}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Account Status</label>
            <p className={`mt-1 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email Verified</label>
            <p className="text-gray-800">{user.is_verified ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Member Since</label>
            <p className="text-gray-800">{formatDate(user.created_at, 'MMM dd, yyyy')}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Login</label>
            <p className="text-gray-800">{formatDate(user.last_login, 'MMM dd, yyyy')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;