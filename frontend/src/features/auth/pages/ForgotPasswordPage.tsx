import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { axiosInstance } from '../../../services/axios';
import { getErrorMessage } from '../../../services/errorHandler';
import { API_ENDPOINTS, ROUTES } from '../../../utils/constants';
import { Button, Input } from '../../../components/ui';
import { AuthHeading, FormAlert } from '../components/AuthParts';

const schema = z.object({ email: z.string().trim().email('Enter a valid email') });

export const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: z.infer<typeof schema>) => {
    setError(null);
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSent(email);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><MailCheck className="h-8 w-8" /></div>
        <h1 className="text-3xl font-extrabold">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink-500">If an account exists for <b className="text-ink-800">{sent}</b>, we’ve sent a link to reset your password. It’s valid for 30 minutes.</p>
        <Link to={ROUTES.LOGIN}><Button variant="outline" className="mt-8" block>Back to login</Button></Link>
      </div>
    );
  }
  return (
    <>
      <AuthHeading title="Forgot your password?" subtitle="Enter your email and we’ll send you a reset link." />
      <FormAlert message={error} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input label="Email" type="email" autoComplete="email" leftIcon={<Mail className="h-4.5 w-4.5" />} {...register('email')} error={errors.email?.message} />
        <Button type="submit" size="lg" block loading={isSubmitting}>Send reset link</Button>
      </form>
      <Link to={ROUTES.LOGIN} className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-ink-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
    </>
  );
};

export default ForgotPasswordPage;
