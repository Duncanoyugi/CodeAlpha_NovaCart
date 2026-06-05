import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { useGetMyOrdersQuery } from '../../orders/api/orderApi';
import { useCreateReviewMutation } from '../api/reviewApi';
import { reviewSchema } from '../schemas/reviewSchema';
import type { ReviewFormData } from '../schemas/reviewSchema';
import { ROUTES } from '../../../utils/constants';
import toast from 'react-hot-toast';

export const WriteReviewPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const { data: ordersData } = useGetMyOrdersQuery({});
  
  const methods = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema) as Resolver<ReviewFormData>,
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
    },
  });

  const { handleSubmit, register, watch, setValue, formState: { errors } } = methods;
  const rating = watch('rating');

  useEffect(() => {
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
      toast.success('Review submitted successfully! It will be visible after admin approval.');
      navigate(ROUTES.PRODUCT_DETAIL(productId.replace(/:/g, '')));
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Write a Review</h1>
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              {...register('title')}
              className="input-field"
              placeholder="Great product!"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review</label>
            <textarea
              {...register('comment')}
              className="input-field min-h-[120px]"
              placeholder="Tell others what you think about this product..."
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};