import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAppDispatch } from '../../../redux/hooks';
import { googleLogin } from '../../../redux/slices/authSlice';

interface GoogleButtonProps {
  /** 'signin' shows "Sign in with Google", 'signup' shows "Sign up with Google" */
  intent?: 'signin' | 'signup';
  onSuccess?: () => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const TEXT_MAP: Record<NonNullable<GoogleButtonProps['intent']>, 'signin_with' | 'signup_with'> = {
  signin: 'signin_with',
  signup: 'signup_with',
};

/**
 * Wraps `@react-oauth/google` so the rest of the app never imports it directly.
 *
 * Flow:
 * 1. Google returns an **ID token** (credential) to the browser.
 * 2. The credential is sent to the NovaCart backend.
 * 3. The backend verifies the token with Google, finds/creates the user,
 *    and returns NovaCart JWT tokens — which the authSlice stores.
 */
export const GoogleButton: React.FC<GoogleButtonProps> = ({
  intent = 'signin',
  onSuccess,
}) => {
  const dispatch = useAppDispatch();

  if (!GOOGLE_CLIENT_ID) {
    console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google button is disabled.');
    return null;
  }

  const handleCredential = async (cred: CredentialResponse) => {
    if (!cred.credential) {
      console.error('Google did not return a credential.');
      return;
    }
    const resultAction = await dispatch(googleLogin(cred.credential));
    if (googleLogin.fulfilled.match(resultAction)) {
      onSuccess?.();
    }
  };

  return (
    <GoogleLogin
      shape="rectangular"
      size="large"
      text={TEXT_MAP[intent]}
      theme="outline"
      onSuccess={handleCredential}
      onError={() => {
        console.error('Google login failed');
      }}
    />
  );
};

export default GoogleButton;
