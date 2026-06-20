import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../api/authApi';
import { ROUTES } from '../../../utils/constants';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await forgotPassword({ email }).unwrap();
      toast.success(response.message || 'Reset link sent if the account exists.');
    } catch {
      toast.error('Unable to request password reset. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Forgot password</h1>
      <p className="text-gray-600 mb-6">Enter your account email and we will send a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <Link to={ROUTES.LOGIN} className="block text-center text-sm text-primary-600 mt-6">
        Back to login
      </Link>
    </div>
  );
};
