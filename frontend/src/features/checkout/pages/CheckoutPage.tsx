import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { MainLayout } from '../../../layouts/MainLayout';
import { ShippingForm } from '../components/ShippingForm';
import { BillingForm } from '../components/BillingForm';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { CheckoutSteps } from '../components/CheckoutSteps';
import { CartSummary } from '../../../components/cart/CartSummary';
import { useCart } from '../../cart';
import { useCreateOrderMutation } from '../../orders/api/orderApi';
import { checkoutSchema } from '../schemas/checkoutSchema';
import { ROUTES } from '../../../utils/constants';
import type { CheckoutFormData } from '../schemas/checkoutSchema';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const steps = ['Shipping', 'Billing', 'Payment'];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [, setIsProcessingPayment] = useState(false);
  const { cart, totalItems, subtotal, shippingCost, taxAmount, totalAmount, getCart } = useCart();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

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

  const { handleSubmit, trigger, getValues } = methods;

  useEffect(() => {
    if (totalItems === 0 && !cart) {
      getCart();
    }
  }, [totalItems, cart, getCart]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ['shipping_address'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['billing_address'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['payment_method'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === steps.length - 1) {
        // Create order first
        const formData = getValues();
        try {
          const result = await createOrder(formData).unwrap();
          setOrderId(result.order_id);
          // Move to next step to show payment form
          setCurrentStep(currentStep + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
          console.error('Order creation failed:', error);
        }
      } else {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
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
    // Stay on payment step to retry
  };

  if (totalItems === 0 && !cart?.total_items && !orderId) {
    navigate(ROUTES.CART);
    return null;
  }

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <CheckoutSteps currentStep={currentStep} steps={steps} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Step 1 & 2: Order Form */}
              {currentStep < 2 && (
                <FormProvider {...methods}>
                  <form id="checkout-form" onSubmit={handleSubmit(() => {})}>
                    {currentStep === 0 && <ShippingForm />}
                    {currentStep === 1 && <BillingForm />}
                  </form>
                </FormProvider>
              )}

              {/* Step 3: Payment Form */}
              {currentStep === 2 && orderId && (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    orderId={orderId}
                    amount={totalAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onProcessing={setIsProcessingPayment}
                  />
                </Elements>
              )}

              {/* Step 4: Payment Processing */}
              {currentStep === 3 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                  <p className="text-gray-500">Please wait while we confirm your payment...</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons (only for steps 0-1) */}
            {currentStep < 2 && (
              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isCreatingOrder}
                  className="btn-primary ml-auto flex items-center gap-2"
                >
                  {isCreatingOrder ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : currentStep === steps.length - 1 ? (
                    'Place Order'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
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
    </MainLayout>
  );
};