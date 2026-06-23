import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ShippingForm } from '../components/ShippingForm';
import { BillingForm } from '../components/BillingForm';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { CartSummary } from '../../../components/cart/CartSummary';
import { useCart } from '../../cart';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCreateOrderMutation } from '../../orders/api/orderApi';
import { checkoutSchema } from '../schemas/checkoutSchema';
import { ROUTES } from '../../../utils/constants';
import type { CheckoutFormData } from '../schemas/checkoutSchema';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const steps = [
  { label: 'Shipping', icon: 'Package' },
  { label: 'Billing', icon: 'Truck' },
  { label: 'Payment', icon: 'CreditCard' },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [, setIsProcessingPayment] = useState(false);
  const { cart, totalItems, subtotal, shippingCost, taxAmount, totalAmount, getCart } = useCart();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CHECKOUT } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      shipping_address: {
        full_name: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      },
      billing_address: {
        same_as_shipping: true,
      },
      payment_method: 'stripe',
      customer_notes: '',
      coupon_code: '',
    },
  });

  const { trigger, getValues } = methods;

  useEffect(() => {
    if (totalItems === 0 && !cart) {
      getCart();
    }
  }, [totalItems, cart, getCart]);

  const extractOrderId = (result: any): string | null => {
    // Backend returns: { success, message, data: { order_id, ... } }
    return result?.data?.order_id ?? result?.order_id ?? null;
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];
    let shouldCreateOrder = false;

    if (currentStep === 0) {
      fieldsToValidate = ['shipping_address'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['billing_address'];
      shouldCreateOrder = true;
    } else if (currentStep === 2) {
      fieldsToValidate = ['payment_method'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    if (shouldCreateOrder) {
      const formData = getValues();
      try {
        const result = await createOrder(formData).unwrap();
        setOrderId(extractOrderId(result));
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error: any) {
        const msg = error?.data?.message || error?.data?.errors || 'Order creation failed. Please check your details.';
        console.error('Order creation failed:', error);
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      return;
    }

    if (currentStep === steps.length - 1) {
      const formData = getValues();
      try {
        const result = await createOrder(formData).unwrap();
        setOrderId(extractOrderId(result));
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error: any) {
        const msg = error?.data?.message || error?.data?.errors || 'Order creation failed. Please check your details.';
        console.error('Order creation failed:', error);
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      return;
    }

    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = () => {
    navigate(`${ROUTES.ORDER_SUCCESS}?order_id=${orderId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  useEffect(() => {
    if (totalItems === 0 && !cart?.total_items && !orderId) {
      navigate(ROUTES.CART);
    }
  }, [totalItems, cart, orderId, navigate]);

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="container-custom page-padding">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--color-gold-600)] font-semibold">
            Secure Checkout
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--color-text-primary)] mt-2">Checkout</h1>
        </div>

        <CheckoutSteps currentStep={currentStep} steps={steps.map((s) => s.label)} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] p-6 lg:p-8">
              {currentStep < 2 && (
                <FormProvider {...methods}>
                  <form id="checkout-form" onSubmit={methods.handleSubmit(() => {})}>
                    {currentStep === 0 && <ShippingForm />}
                    {currentStep === 1 && <BillingForm />}
                  </form>
                </FormProvider>
              )}

              {currentStep === 2 && orderId && (
                <div className="animate-fade-in">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      orderId={orderId}
                      amount={totalAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onProcessing={setIsProcessingPayment}
                    />
                  </Elements>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-gold-50)] flex items-center justify-center shadow-[var(--shadow-gold)]">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-gold-500)] border-r-transparent" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">Processing Payment</h3>
                  <p className="font-ui text-sm text-[var(--color-text-secondary)]">Please wait while we confirm your payment...</p>
                </div>
              )}
            </div>

            {currentStep < 2 && (
              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-6 py-3 text-sm font-ui font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border-medium)] rounded-[var(--radius-lg)] transition-all active:scale-[0.97]"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isCreatingOrder}
                  className="ml-auto px-8 py-3.5 text-sm font-ui font-semibold bg-[var(--color-gold-500)] hover:bg-[var(--color-gold-400)] text-white rounded-[var(--radius-lg)] shadow-[var(--shadow-gold)] hover:shadow-lg transition-all flex items-center gap-2 active:scale-[0.97]"
                >
                  {isCreatingOrder ? (
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent shrink-0" />
                  ) : null}
                  {isCreatingOrder ? 'Processing...' : 'Continue'}
                  {!isCreatingOrder && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-96">
            <CartSummary
              subtotal={subtotal}
              shippingCost={shippingCost}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              itemCount={totalItems}
              isCheckout
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

