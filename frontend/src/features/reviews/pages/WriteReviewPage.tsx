import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { useGetMyOrdersQuery } from '../../orders/api/orderApi';
import { useCreateReviewMutation } from '../api/reviewApi';
import { reviewSchema } from '../schemas/reviewSchema';
import type { ReviewFormData } from '../schemas/reviewSchema';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Rating } from '../../../components/common/Rating';
import toast from 'react-hot-toast';

export const WriteReviewPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const { data: ordersData } = useGetMyOrdersQuery({});

  const methods = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', comment: '' },
  });

  const { handleSubmit, register, watch, setValue, formState: { errors } } = methods;
  const rating = watch('rating');

  React.useEffect(() => {
    if (!productId || !ordersData?.orders?.length) return;
    const hasPurchased = ordersData.orders.some(
      (order: any) => order.items?.some((item: any) => item.product_id === productId)
    );
    if (!hasPurchased) {
      navigate(ROUTES.ORDER_DETAIL(productId));
    }
  }, [productId, ordersData, navigate]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!productId) return;
    try {
      await createReview({ ...data, product: productId }).unwrap();
      toast.success('Review submitted successfully!');
      navigate(ROUTES.PRODUCT_DETAIL(productId.replace(/:/g, '')));
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)]">Reviews</span>
      <h1 className="font-display text-3xl text-[var(--color-text-primary)] mt-2">Write a Review</h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-3">Rating</label>
            <Rating value={rating} onChange={(val) => setValue('rating', val)} size="lg" />
            {errors.rating && <p className="mt-1 text-xs text-[var(--color-danger-text)]">{errors.rating.message}</p>}
          </div>

          <Input label="Title" error={errors.title?.message} {...register('title')} placeholder="Great product!" />
          <div>
            <label className="block font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">Review</label>
            <textarea {...register('comment')} className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none min-h-[120px]" placeholder="Tell others what you think..." />
            {errors.comment && <p className="mt-1 text-xs text-[var(--color-danger-text)]">{errors.comment.message}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">{isLoading ? 'Submitting...' : 'Submit Review'}</Button>
        </form>
      </FormProvider>
    </div>
  );
};
