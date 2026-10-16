import axios from 'axios';

type Json = Record<string, unknown>;

const firstString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return firstString(value[0]);
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Json)) {
      const found = firstString(v);
      if (found) return found;
    }
  }
  return null;
};

/** Turn any API/network failure into one human sentence. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (typeof error === 'string') return error;
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Cannot reach the server. Check your internet connection and try again.';
    const data = error.response.data as Json | undefined;
    if (data) {
      if (typeof data.message === 'string') return data.message;
      const errors = data.errors as Json | undefined;
      if (errors) {
        if (typeof errors.detail === 'string') return errors.detail;
        const msg = firstString(errors);
        if (msg) return msg;
      }
      const nested = (data.error as Json | undefined)?.message;
      if (typeof nested === 'string') return nested;
      if (typeof data.detail === 'string') return data.detail;
    }
    if (error.response.status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (error.response.status >= 500) return 'Our server had a problem. Please try again shortly.';
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** Field-level errors from DRF serializers: { email: 'Already used', ... } */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError(error)) return {};
  const errors = (error.response?.data as Json | undefined)?.errors as Json | undefined;
  if (!errors) return {};
  const out: Record<string, string> = {};
  Object.entries(errors).forEach(([key, value]) => {
    const message = firstString(value);
    if (message) out[key] = message;
  });
  return out;
};

export const getErrorCode = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  const errors = (error.response?.data as Json | undefined)?.errors as Json | undefined;
  return typeof errors?.code === 'string' ? errors.code : Array.isArray(errors?.code) ? String(errors?.code[0]) : undefined;
};
