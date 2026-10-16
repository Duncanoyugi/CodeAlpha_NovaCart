import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useChangePasswordMutation } from '../api/userApi';
import { AccountShell } from '../components/AccountShell';
import { Button, Card } from '../../../components/ui';
import { PasswordChecklist, PasswordInput } from '../../auth/components/AuthParts';
import { getFieldErrors } from '../../../services/errorHandler';

const schema = z.object({
  old_password: z.string().min(1, 'Enter your current password'),
  new_password: z.string().min(8, 'Use at least 8 characters').regex(/[A-Za-z]/, 'Include a letter').regex(/\d/, 'Include a number'),
  confirm_password: z.string(),
}).refine((v) => v.new_password === v.confirm_password, { path: ['confirm_password'], message: 'Passwords don’t match' });
type Values = z.infer<typeof schema>;

export const ChangePasswordPage: React.FC = () => {
  const [change, { isLoading }] = useChangePasswordMutation();
  const { register, handleSubmit, reset, watch, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    try {
      await change(v).unwrap();
      toast.success('Password changed');
      reset();
    } catch (err) {
      const fields = getFieldErrors({ isAxiosError: true, response: { data: (err as { data?: unknown }).data } });
      if (fields.current_password) setError('old_password', { message: fields.current_password });
      else if (fields.new_password) setError('new_password', { message: fields.new_password });
      else toast.error((err as { message?: string }).message ?? 'Could not change your password');
    }
  };

  return (
    <AccountShell title="Change password" subtitle="Use a strong password you don’t use anywhere else.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg">
        <Card className="space-y-4 p-6">
          <PasswordInput label="Current password" autoComplete="current-password" {...register('old_password')} error={errors.old_password?.message} />
          <div><PasswordInput label="New password" autoComplete="new-password" {...register('new_password')} error={errors.new_password?.message} /><PasswordChecklist value={watch('new_password') ?? ''} /></div>
          <PasswordInput label="Confirm new password" autoComplete="new-password" {...register('confirm_password')} error={errors.confirm_password?.message} />
        </Card>
        <Button type="submit" className="mt-5" loading={isLoading}>Update password</Button>
      </form>
    </AccountShell>
  );
};

export default ChangePasswordPage;
