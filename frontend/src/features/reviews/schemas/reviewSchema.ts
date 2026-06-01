import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please choose a rating').max(5),
  title: z.string().min(5, 'Please enter a title'),
  comment: z.string().min(10, 'Please write a review of at least 10 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
