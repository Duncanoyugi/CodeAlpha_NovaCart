import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useGetProfileQuery } from '../hooks/profileHooks';
import { useUpdateProfileMutation } from '../api/userApi';
import { useAppDispatch } from '../../../redux/hooks';
import { setUser } from '../../../redux/slices/authSlice';
import { AccountShell } from '../components/AccountShell';
import { Button, Card, Input, Select } from '../../../components/ui';
import { KENYA_COUNTIES, KENYAN_PHONE, cleanPhone } from '../../../utils/kenya';
import { ROUTES } from '../../../utils/constants';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  phone_number: z.string().optional().refine((v) => !v || KENYAN_PHONE.test(cleanPhone(v)), 'Enter a valid Kenyan phone number'),
  address_line1: z.string().optional(), address_line2: z.string().optional(), city: z.string().optional(), state: z.string().optional(), postal_code: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: user } = useGetProfileQuery();
  const [update, { isLoading }] = useUpdateProfileMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (user) reset({ full_name: user.full_name, phone_number: user.phone_number ?? '', address_line1: user.address_line1 ?? '', address_line2: user.address_line2 ?? '', city: user.city ?? '', state: user.state ?? '', postal_code: user.postal_code ?? '' });
  }, [user, reset]);

  const onSubmit = async (v: Values) => {
    try {
      const updated = await update({ ...v, phone_number: v.phone_number ? cleanPhone(v.phone_number) : '', country: 'Kenya' }).unwrap();
      dispatch(setUser({ ...(user as object), ...(updated as object) } as never));
      toast.success('Profile updated');
      navigate(ROUTES.PROFILE);
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not update your profile');
    }
  };

  return (
    <AccountShell title="Edit profile">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <Input label="Full name" {...register('full_name')} error={errors.full_name?.message} />
          <Input label="Phone" inputMode="tel" placeholder="0712 345 678" {...register('phone_number')} error={errors.phone_number?.message} />
          <div className="sm:col-span-2"><Input label="Street address" {...register('address_line1')} /></div>
          <div className="sm:col-span-2"><Input label="Apartment / landmark" {...register('address_line2')} /></div>
          <Input label="Town / city" {...register('city')} />
          <Select label="County" {...register('state')}><option value="">Select county</option>{KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}</Select>
          <Input label="Postal code" {...register('postal_code')} />
        </Card>
        <div className="mt-5 flex gap-3"><Button type="submit" loading={isLoading}>Save changes</Button><Button variant="outline" onClick={() => navigate(ROUTES.PROFILE)}>Cancel</Button></div>
      </form>
    </AccountShell>
  );
};

export default EditProfilePage;
