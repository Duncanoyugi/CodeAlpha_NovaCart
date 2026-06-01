import React, { useEffect } from 'react';
import { MainLayout } from '../../../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

export const ProfilePage: React.FC = () => {
  const { user, isLoading, isAuthenticated, logout, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && isAuthenticated) {
      getCurrentUser();
    }
  }, [user, isAuthenticated, getCurrentUser]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded" />
            <div className="h-6 w-72 bg-gray-200 rounded" />
            <div className="h-6 w-64 bg-gray-200 rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="container-custom py-12 text-center">
          <p className="text-gray-500 mb-4">You need to be logged in to view your profile.</p>
          <button onClick={() => navigate(ROUTES.LOGIN)} className="btn-primary">
            Login
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-500 mt-2">Manage your account and preferences.</p>
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center rounded-3xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-800">Full Name</p>
                  <p>{user.full_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Role</p>
                  <p className="capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-800">Joined On</p>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Status</p>
                  <p>{user.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Verified</p>
                  <p>{user.is_verified ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};