import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import { useRegisterMutation } from '../api/authApi';
import { registerSchema } from '../schemas/authSchema';
import type { RegisterFormData } from '../schemas/authSchema';
import { ROUTES } from '../../../utils/constants';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', full_name: '', phone_number: '', password: '', password2: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data).unwrap();
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email } });
    } catch (e) { /* handled by toast */ }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-[var(--color-text-primary)] mb-2">Create Account</h2>
        <p className="font-ui text-sm text-[var(--color-text-secondary)]">Join NovaCart and start shopping</p>
      </div>

      <Input
        label="Full Name"
        icon={<User className="w-5 h-5" />}
        error={errors.full_name?.message}
        placeholder="John Doe"
        autoComplete="name"
        {...register('full_name')}
      />
      <Input
        label="Email Address"
        type="email"
        icon={<Mail className="w-5 h-5" />}
        error={errors.email?.message}
        placeholder="you@example.com"
        autoComplete="email"
        {...register('email')}
      />
      <Input
        label="Phone Number (Optional)"
        type="tel"
        icon={<Phone className="w-5 h-5" />}
        placeholder="+1 (555) 000-0000"
        autoComplete="tel"
        {...register('phone_number')}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          placeholder="Create a strong password"
          autoComplete="new-password"
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-[38px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          icon={<Lock className="w-5 h-5" />}
          error={errors.password2?.message}
          placeholder="Confirm your password"
          autoComplete="new-password"
          {...register('password2')}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3.5 top-[38px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          tabIndex={-1}
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full h-12 text-sm font-semibold shadow-[var(--shadow-gold)]"
          rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
        >
          Create Account
        </Button>
      </div>

      <p className="text-center font-ui text-sm text-[var(--color-text-secondary)] pt-1">
        Already have an account? <Link to={ROUTES.LOGIN} className="text-[var(--color-text-accent)] hover:underline font-semibold">Sign in</Link>
      </p>
    </form>
  );
};
