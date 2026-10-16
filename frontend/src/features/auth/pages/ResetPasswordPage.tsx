import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { axiosInstance } from '../../../services/axios';
import { getErrorMessage } from '../../../services/errorHandler';
import { API_ENDPOINTS, ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/ui';
import { AuthHeading, FormAlert, PasswordChecklist, PasswordInput } from '../components/AuthParts';

const schema = z.object({
  password: z.string().min(8, 'Use at least 8 characters').regex(/[A-Za-z]/, 'Include a letter').regex(/\d/, 'Include a number'),
  password2: z.string(),
}).refine((v) => v.password === v.password2, { path: ['password2'], message: 'Passwords don’t match' });
type Values = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError(null);
    try {
      // Server contract: { token, password, password2 }
      await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, ...values });
      toast.success('Password updated. Please log in.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'This reset link is invalid or has expired.'));
    }
  };

  return (
    <>
      <AuthHeading title="Set a new password" subtitle="Choose a strong password you haven’t used before." />
      <FormAlert message={error} />
      {error && <p className="-mt-2 mb-4 text-sm"><Link to={ROUTES.FORGOT_PASSWORD} className="font-bold text-brand-700 hover:underline">Request a new link</Link></p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div><PasswordInput label="New password" autoComplete="new-password" {...register('password')} error={errors.password?.message} /><PasswordChecklist value={watch('password') ?? ''} /></div>
        <PasswordInput label="Confirm new password" autoComplete="new-password" {...register('password2')} error={errors.password2?.message} />
        <Button type="submit" size="lg" block loading={isSubmitting}>Update password</Button>
      </form>
    </>
  );
};

export default ResetPasswordPage;
