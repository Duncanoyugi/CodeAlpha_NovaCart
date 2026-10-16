import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearError, login, resendOTP } from '../../../redux/slices/authSlice';
import { Button, Input } from '../../../components/ui';
import { AuthHeading, FormAlert, PasswordInput } from '../components/AuthParts';
import { GoogleButton } from '../components/GoogleButton';
import { ROUTES } from '../../../utils/constants';

const schema = z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
type Values = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [needsVerify, setNeedsVerify] = React.useState<string | null>(null);
  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  React.useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const onSubmit = async (values: Values) => {
    setNeedsVerify(null);
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.full_name.split(' ')[0]}!`);
      navigate((from?.pathname ?? ROUTES.HOME) + (from?.search ?? ''), { replace: true });
    } else if (result.payload?.code === 'email_not_verified') {
      setNeedsVerify(values.email);
    }
  };

  const goVerify = async () => {
    const email = needsVerify ?? getValues('email');
    await dispatch(resendOTP(email));
    navigate(ROUTES.VERIFY_OTP, { state: { email } });
  };

  const handleGoogleSuccess = () => {
    const target = from?.pathname ?? ROUTES.HOME;
    navigate(target + (from?.search ?? ''), { replace: true });
  };

  return (
    <>
      <AuthHeading title="Welcome back" subtitle="Log in to track orders, save favourites and check out faster." />
      <FormAlert message={error} />
      {needsVerify && <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Your email isn’t verified yet. <button onClick={goVerify} className="font-bold underline">Send me a new code</button></div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input label="Email" type="email" autoComplete="email" leftIcon={<Mail className="h-4.5 w-4.5" />} placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
        <div>
          <PasswordInput label="Password" autoComplete="current-password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
          <div className="mt-2 text-right"><Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-semibold text-brand-700 hover:underline">Forgot password?</Link></div>
        </div>
        <Button type="submit" size="lg" block loading={isLoading}>Log in</Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-ink-400">or continue with</span>
          </div>
        </div>

        <GoogleButton intent="signin" onSuccess={handleGoogleSuccess} />
      </form>
      <p className="mt-8 text-center text-sm text-ink-500">New to NovaCart? <Link to={ROUTES.REGISTER} state={location.state} className="font-bold text-brand-700 hover:underline">Create an account</Link></p>
    </>
  );
};

export default LoginPage;
