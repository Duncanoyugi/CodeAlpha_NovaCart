import React from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfile } from '../hooks/useProfile';
import { profileSchema } from '../schemas/profileSchema';
import type { ProfileFormData } from '../schemas/profileSchema';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

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
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                {...register('full_name')}
                className="input-field"
                disabled={isUpdating}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                {...register('phone_number')}
                className="input-field"
                disabled={isUpdating}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
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
                disabled={isUpdating}
                className="btn-primary"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};