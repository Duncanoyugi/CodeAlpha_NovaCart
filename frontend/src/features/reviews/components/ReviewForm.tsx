import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewFormData } from '../schemas/reviewSchema';

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: '',
      comment: '',
    },
  });

  const handleFormSubmit = async (data: ReviewFormData) => {
    await onSubmit(data);
    reset({ rating: 5, title: '', comment: '' });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Your review helps other shoppers make smarter choices. Keep it honest, clear, and useful.
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <select
          {...register('rating', { valueAsNumber: true })}
          className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>{rating} Stars</option>
          ))}
        </select>
        {errors.rating && <p className="mt-2 text-sm text-red-600">{errors.rating.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          {...register('title')}
          placeholder="Review title"
          className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
        />
        {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Review</label>
        <textarea
          {...register('comment')}
          placeholder="Share your experience"
          rows={5}
          className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-primary-500 focus:outline-none"
        />
        {errors.comment && <p className="mt-2 text-sm text-red-600">{errors.comment.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full rounded-3xl py-3 text-sm font-semibold"
      >
        {isLoading ? 'Posting review...' : 'Post review'}
      </button>
    </form>
  );
};