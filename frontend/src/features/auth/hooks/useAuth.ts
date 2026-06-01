import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { login, logout, getCurrentUser, clearError } from '../../../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: (email: string, password: string) => dispatch(login({ email, password })),
    logout: () => dispatch(logout()),
    getCurrentUser: () => dispatch(getCurrentUser()),
    clearError: () => dispatch(clearError()),
  };
};