import React from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile } from '../hooks/useProfile';
import { changePasswordSchema } from '../schemas/profileSchema';
import type { ChangePasswordFormData } from '../schemas/profileSchema';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserPassword, isChangingPassword } = useProfile();
  
  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema) as Resolver<ChangePasswordFormData>,
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const { handleSubmit, register, formState: { errors } } = methods;

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await updateUserPassword(data);
      navigate(ROUTES.PROFILE);
    } catch {
      // Error handled in useProfile
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                {...register('old_password')}
                className="input-field"
                disabled={isChangingPassword}
              />
              {errors.old_password && (
                <p className="mt-1 text-sm text-red-600">{errors.old_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                {...register('new_password')}
                className="input-field"
                disabled={isChangingPassword}
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                {...register('confirm_password')}
                className="input-field"
                disabled={isChangingPassword}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.PROFILE)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-primary"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};