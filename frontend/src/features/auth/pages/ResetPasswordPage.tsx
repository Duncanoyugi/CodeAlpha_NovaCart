import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../api/authApi';
import { ROUTES } from '../../../utils/constants';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      toast.error('Reset link is invalid.');
      return;
    }
    if (password !== password2) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, password, password2 }).unwrap();
      toast.success('Password reset successfully. Please log in.');
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error('Unable to reset password. The link may have expired.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Reset password</h1>
      <p className="text-gray-600 mb-6">Choose a new password for your NovaCart account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            New password
          </label>
          <input
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password2" className="block text-sm font-medium mb-2">
            Confirm password
          </label>
          <input
            id="password2"
            type="password"
            className="input-field"
            value={password2}
            onChange={(event) => setPassword2(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

      <Link to={ROUTES.LOGIN} className="block text-center text-sm text-primary-600 mt-6">
        Back to login
      </Link>
    </div>
  );
};
