import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="container-custom py-12">
      <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Account</span>
      <h1 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">My Profile</h1>

      <div className="mt-8 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] space-y-6">
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Full Name</span>
          <p className="font-display text-lg text-[var(--color-text-primary)] mt-1">{user?.full_name}</p>
        </div>
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Email</span>
          <p className="font-ui text-sm text-[var(--color-text-primary)] mt-1">{user?.email}</p>
        </div>
        <div>
          <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">Phone Number</span>
          <p className="font-ui text-sm text-[var(--color-text-primary)] mt-1">{user?.phone_number || 'Not set'}</p>
        </div>
        <div className="pt-6 border-t border-[var(--color-border-light)] flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.EDIT_PROFILE)}>Edit Profile</Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}>Change Password</Button>
        </div>
      </div>
    </div>
  );
};