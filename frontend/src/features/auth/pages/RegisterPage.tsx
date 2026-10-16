import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearError, register as registerUser } from '../../../redux/slices/authSlice';
import { Button, Input } from '../../../components/ui';
import { AuthHeading, FormAlert, PasswordChecklist, PasswordInput } from '../components/AuthParts';
import { GoogleButton } from '../components/GoogleButton';
import { KENYAN_PHONE, cleanPhone } from '../../../utils/kenya';
import { ROUTES } from '../../../utils/constants';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email'),
  phone_number: z.string().optional().refine((v) => !v || KENYAN_PHONE.test(cleanPhone(v)), 'Enter a valid Kenyan phone number'),
  password: z.string().min(8, 'Use at least 8 characters').regex(/[A-Za-z]/, 'Include a letter').regex(/\d/, 'Include a number'),
  password2: z.string(),
}).refine((v) => v.password === v.password2, { path: ['password2'], message: 'Passwords don’t match' });
type Values = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  React.useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const onSubmit = async (values: Values) => {
    const payload = { ...values, phone_number: values.phone_number ? cleanPhone(values.phone_number) : undefined };
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Check your email for the code.');
      navigate(ROUTES.VERIFY_OTP, { state: { email: result.payload.email } });
    } else if (result.payload?.fields) {
      Object.entries(result.payload.fields).forEach(([k, message]) => {
        if (k in values) setError(k as keyof Values, { message });
      });
    }
  };

  return (
    <>
      <AuthHeading title="Create your account" subtitle="It takes less than a minute. We’ll email you a quick code to verify." />
      <FormAlert message={error && !Object.keys(errors).length ? error : null} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" autoComplete="name" leftIcon={<User className="h-4.5 w-4.5" />} {...register('full_name')} error={errors.full_name?.message} />
        <Input label="Email" type="email" autoComplete="email" leftIcon={<Mail className="h-4.5 w-4.5" />} {...register('email')} error={errors.email?.message} />
        <Input label="Phone (optional)" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" leftIcon={<Phone className="h-4.5 w-4.5" />} {...register('phone_number')} error={errors.phone_number?.message} />
        <div>
          <PasswordInput label="Password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
          <PasswordChecklist value={watch('password') ?? ''} />
        </div>
        <PasswordInput label="Confirm password" autoComplete="new-password" {...register('password2')} error={errors.password2?.message} />
        <Button type="submit" size="lg" block loading={isLoading}>Create account</Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-ink-400">or continue with</span>
          </div>
        </div>

        <GoogleButton intent="signup" onSuccess={() => navigate(ROUTES.HOME, { replace: true })} />
      </form>
      <p className="mt-8 text-center text-sm text-ink-500">Already have an account? <Link to={ROUTES.LOGIN} className="font-bold text-brand-700 hover:underline">Log in</Link></p>
    </>
  );
};

export default RegisterPage;
