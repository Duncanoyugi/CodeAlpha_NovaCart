import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Full Name" icon={<Mail className="w-5 h-5" />} error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Email" type="email" icon={<Mail className="w-5 h-5" />} error={errors.email?.message} {...register('email')} />
      <Input label="Phone (Optional)" icon={<Mail className="w-5 h-5" />} {...register('phone_number')} />
      <div className="relative">
        <Input label="Password" type={showPassword ? 'text' : 'password'} icon={<Lock className="w-5 h-5" />} error={errors.password?.message} {...register('password')} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <div className="relative">
        <Input label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} icon={<Lock className="w-5 h-5" />} error={errors.password2?.message} {...register('password2')} />
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[38px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">Create Account</Button>
      <p className="text-center font-ui text-sm text-[var(--color-text-secondary)]">
        Already have an account? <Link to={ROUTES.LOGIN} className="text-[var(--color-text-accent)] hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  );
};
