import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join NovaCart for exclusive deals and offers"
    >
      <RegisterForm />
    </AuthLayout>
  );
};