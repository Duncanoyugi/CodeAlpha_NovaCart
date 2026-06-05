import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../layouts/MainLayout';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { ROUTES } from '../../../utils/constants';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
            <p className="text-lg">{user?.full_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="text-lg">{user?.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
            <p className="text-lg">{user?.phone_number || 'Not set'}</p>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => navigate(ROUTES.EDIT_PROFILE)}
              className="btn-secondary mr-4"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
              className="btn-secondary"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};