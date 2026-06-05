import { useCancelOrderMutation, useCreateOrderMutation } from '../api/orderApi';
import type { CheckoutData } from '../../../types';

export const useOrders = () => {
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const cancelUserOrder = async (orderId: string, reason?: string) => {
    try {
      return await cancelOrder({ orderId, reason }).unwrap();
    } catch {
      throw new Error('Failed to cancel order');
    }
  };

  const createNewOrder = async (data: CheckoutData) => {
    try {
      return await createOrder(data).unwrap();
    } catch {
      throw new Error('Failed to create order');
    }
  };

  return {
    cancelUserOrder,
    createNewOrder,
    isCancelling,
    isCreating,
  };
};