import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OTPInput } from '../../../components/forms/OTPInput';
import { useVerifyOTPMutation, useResendOTPMutation } from '../../auth/api/authApi';
import { ROUTES } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import toast from 'react-hot-toast';

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [resendOTP] = useResendOTPMutation();

  useEffect(() => {
    if (!email) navigate(ROUTES.REGISTER);
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    try {
      await verifyOTP({ email, otp_code: otp }).unwrap();
      toast.success('Email verified successfully!');
      navigate(ROUTES.HOME, { replace: true });
    } catch (e) {
      // toast handled by interceptor
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap();
      toast.success('OTP resent successfully!');
      setCooldown(60);
    } catch (e) {
      // toast handled
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-2">Verify Your Email</h1>
          <p className="font-ui text-sm text-[var(--color-text-secondary)]">We've sent a verification code to {email}</p>
        </div>
        <div className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} />
          <Button onClick={handleVerify} isLoading={isLoading} className="w-full" disabled={otp.length !== 6}>
            Verify Email
          </Button>
          <div className="text-center">
            {cooldown > 0 ? (
              <p className="font-ui text-xs text-[var(--color-text-tertiary)]">Resend code in {cooldown}s</p>
            ) : (
              <button type="button" onClick={handleResend} className="font-ui text-xs text-[var(--color-text-accent)] hover:underline">Resend Code</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};