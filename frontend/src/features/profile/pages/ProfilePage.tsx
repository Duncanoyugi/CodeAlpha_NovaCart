import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import { User, Mail, Phone, Calendar, Settings, Shield, ArrowRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)] font-semibold">Account</span>
        <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">My Profile</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[var(--color-gold-100)] to-[var(--color-gold-200)] flex items-center justify-center mb-4 shadow-lg ring-4 ring-[var(--color-gold-50)]">
              <span className="text-3xl font-display font-bold text-[var(--color-gold-700)]">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-1">{user?.full_name || 'User'}</h3>
            <p className="font-ui text-sm text-[var(--color-text-tertiary)] mb-6">{user?.email || ''}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-gold-50)] border border-[var(--color-gold-100)]">
              <Shield className="w-3.5 h-3.5 text-[var(--color-gold-500)]" />
              <span className="text-xs font-ui font-semibold text-[var(--color-gold-700)]">{user?.role || 'Customer'}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-light)]">
              <span className="text-xs font-ui text-[var(--color-text-tertiary)] uppercase tracking-wider">Member Since</span>
              <span className="text-sm font-ui font-medium text-[var(--color-text-primary)]">2024</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-ui text-[var(--color-text-tertiary)] uppercase tracking-wider">Orders</span>
              <span className="text-sm font-ui font-medium text-[var(--color-text-primary)]">0</span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--color-border-light)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--color-gold-500)]" />
                </div>
                <h3 className="font-ui text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-[0.06em]">Personal Information</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.EDIT_PROFILE)} className="gap-2">
                <Settings className="w-4 h-4" />
                Edit
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]/50">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-raised)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-light)]">
                  <User className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                </div>
                <div className="flex-1">
                  <span className="font-ui text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] font-semibold">Full Name</span>
                  <p className="font-ui text-base font-semibold text-[var(--color-text-primary)] mt-1">{user?.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]/50">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-raised)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-light)]">
                  <Mail className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                </div>
                <div className="flex-1">
                  <span className="font-ui text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] font-semibold">Email</span>
                  <p className="font-ui text-base font-semibold text-[var(--color-text-primary)] mt-1">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]/50">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-raised)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border-light)]">
                  <Phone className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                </div>
                <div className="flex-1">
                  <span className="font-ui text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] font-semibold">Phone Number</span>
                  <p className="font-ui text-base font-semibold text-[var(--color-text-primary)] mt-1">{user?.phone_number || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
              className="flex items-center gap-4 p-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-medium)] transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--color-gold-500)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-ui text-sm font-bold text-[var(--color-text-primary)]">Change Password</p>
                <p className="font-ui text-xs text-[var(--color-text-tertiary)]">Update your password</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-gold-500)] group-hover:translate-x-1 transition-all" />
            </button>
            <button
              onClick={() => navigate(ROUTES.EDIT_PROFILE)}
              className="flex items-center gap-4 p-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-medium)] transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center">
                <Settings className="w-5 h-5 text-[var(--color-gold-500)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-ui text-sm font-bold text-[var(--color-text-primary)]">Edit Profile</p>
                <p className="font-ui text-xs text-[var(--color-text-tertiary)]">Update personal info</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-gold-500)] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};