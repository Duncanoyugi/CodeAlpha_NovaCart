import React from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile } from '../hooks/useProfile';
import { profileSchema } from '../schemas/profileSchema';
import type { ProfileFormData } from '../schemas/profileSchema';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import { User, Phone, ArrowLeft } from 'lucide-react';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, isUpdating } = useProfile();

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormData>,
    defaultValues: {
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
    },
  });

  const { handleSubmit, register, formState: { errors } } = methods;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateUserProfile(data);
      navigate(ROUTES.PROFILE);
    } catch {
      // Error handled in useProfile
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex items-center gap-2 text-sm font-ui text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </button>
        <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)] font-semibold">Account</span>
        <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">Edit Profile</h1>
      </div>

      <div className="max-w-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-border-light)]">
          <p className="font-ui text-sm text-[var(--color-text-secondary)]">Update your personal information below.</p>
        </div>

        <div className="p-6 md:p-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="full_name" className="block font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] mb-2.5">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    {...register('full_name')}
                    className="w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border-medium)] bg-[var(--color-bg-raised)] pl-11 pr-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(196,145,92,0.12)] transition-all"
                    disabled={isUpdating}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-2 text-sm font-ui text-[var(--color-danger-text)] font-medium">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone_number" className="block font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] mb-2.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    id="phone_number"
                    type="tel"
                    {...register('phone_number')}
                    className="w-full rounded-[var(--radius-lg)] border-2 border-[var(--color-border-medium)] bg-[var(--color-bg-raised)] pl-11 pr-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(196,145,92,0.12)] transition-all"
                    disabled={isUpdating}
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-2 text-sm font-ui text-[var(--color-danger-text)] font-medium">{errors.phone_number.message}</p>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[var(--color-border-light)] mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.PROFILE)}
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  isLoading={isUpdating}
                  className="w-full sm:w-auto shadow-[var(--shadow-gold)]"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};