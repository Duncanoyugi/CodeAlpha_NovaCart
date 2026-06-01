import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { useVerifyOTPMutation, useResendOTPMutation } from '../api/authApi';
import { verifyOTPSchema } from '../schemas/authSchema';
import type { VerifyOTPFormData } from '../schemas/authSchema';
import { ROUTES } from '../../../utils/constants';

export const VerifyOTPForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      email: email,
      otp_code: '',
    },
  });

  const otpCode = watch('otp_code');

  // Auto-submit when OTP reaches 6 digits
  useEffect(() => {
    if (otpCode?.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [otpCode]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyOTPFormData) => {
    try {
      const result = await verifyOTP(data).unwrap();
      if (result.user) {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;
    
    try {
      await resendOTP({ email }).unwrap();
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  if (!email) {
    navigate(ROUTES.REGISTER);
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="input-field bg-gray-50"
        />
      </div>

      {/* OTP Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          {...register('otp_code')}
          className="input-field text-center text-2xl tracking-widest font-mono"
          placeholder="••••••"
          maxLength={6}
          disabled={isVerifying}
          autoFocus
        />
        {errors.otp_code && (
          <p className="mt-1 text-sm text-red-600">{errors.otp_code.message}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isVerifying || otpCode?.length !== 6}
        className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
      >
        {isVerifying ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Verify Email
          </>
        )}
      </button>

      {/* Resend OTP */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={!canResend || isResending}
          className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
        >
          {isResending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {canResend ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
        </button>
      </div>
    </form>
  );
};