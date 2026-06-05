import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../api/userApi';
import { setUser } from '../../../redux/slices/authSlice';
import type { UpdateProfileData, ChangePasswordData } from '../../../types';
import toast from 'react-hot-toast';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const updateUserProfile = async (data: UpdateProfileData) => {
    try {
      const result = await updateProfile(data).unwrap();
      dispatch(setUser(result));
      toast.success('Profile updated successfully');
      return result;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const updateUserPassword = async (data: ChangePasswordData) => {
    try {
      const result = await changePassword(data).unwrap();
      toast.success('Password changed successfully');
      return result;
    } catch (error) {
      toast.error('Failed to change password');
      throw error;
    }
  };

  return {
    user,
    updateUserProfile,
    updateUserPassword,
    isUpdating,
    isChangingPassword,
  };
};