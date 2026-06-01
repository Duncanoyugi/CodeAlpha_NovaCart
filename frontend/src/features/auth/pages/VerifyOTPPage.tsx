import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { VerifyOTPForm } from '../components/VerifyOTPForm';

export const VerifyOTPPage: React.FC = () => {
  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Enter the verification code sent to your email"
    >
      <VerifyOTPForm />
    </AuthLayout>
  );
};