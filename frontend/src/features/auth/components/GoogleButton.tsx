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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';

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

  if (!GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    return (
      <div className="space-y-2 text-center">
        <button type="button" disabled className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-500 opacity-70" title="Google sign-in is not configured">
          <GoogleMark />
          {intent === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
        </button>
        <p className="text-xs text-gray-500">Google sign-in is temporarily unavailable.</p>
      </div>
    );
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

const GoogleMark: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" transform="translate(0 4)" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.16 7.14-17.56z" />
    <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19z" transform="translate(0 4)" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)" />
  </svg>
);

export default GoogleButton;
