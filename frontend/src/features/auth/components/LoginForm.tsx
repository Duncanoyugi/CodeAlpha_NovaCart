import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '../api/authApi';
import { loginSchema } from '../schemas/authSchema';
import type { LoginFormData } from '../schemas/authSchema';
import { ROUTES } from '../../../utils/constants';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (result?.user?.role === 'ADMIN' || result?.user?.role === 'STAFF') {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    } catch (e) { /* handled by toast */ }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Email" icon={<Mail className="w-5 h-5" />} error={errors.email?.message} {...register('email')} />
      <div className="relative">
        <Input label="Password" type={showPassword ? 'text' : 'password'} icon={<Lock className="w-5 h-5" />} error={errors.password?.message} {...register('password')} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-[var(--color-border-medium)]" />
          <span className="font-ui text-sm text-[var(--color-text-secondary)]">Remember me</span>
        </label>
        <Link to={ROUTES.FORGOT_PASSWORD} className="font-ui text-sm text-[var(--color-text-accent)] hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">Sign In</Button>
      <p className="text-center font-ui text-sm text-[var(--color-text-secondary)]">
        Don't have an account? <Link to={ROUTES.REGISTER} className="text-[var(--color-text-accent)] hover:underline font-medium">Create account</Link>
      </p>
    </form>
  );
};
