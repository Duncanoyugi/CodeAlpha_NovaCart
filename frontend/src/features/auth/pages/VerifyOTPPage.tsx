import React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { clearError, resendOTP, verifyOTP } from '../../../redux/slices/authSlice';
import { Button } from '../../../components/ui';
import { FormAlert } from '../components/AuthParts';
import { ROUTES } from '../../../utils/constants';

const LENGTH = 6;

export const VerifyOTPPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [digits, setDigits] = React.useState<string[]>(Array(LENGTH).fill(''));
  const [cooldown, setCooldown] = React.useState(60);
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => { dispatch(clearError()); refs.current[0]?.focus(); }, [dispatch]);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const submit = React.useCallback(async (code: string) => {
    if (!email) return;
    const result = await dispatch(verifyOTP({ email, otp_code: code }));
    if (verifyOTP.fulfilled.match(result)) {
      toast.success('Email verified — welcome to NovaCart!');
      navigate(ROUTES.HOME, { replace: true });
    } else {
      setDigits(Array(LENGTH).fill(''));
      refs.current[0]?.focus();
    }
  }, [dispatch, email, navigate]);

  if (!email) return <Navigate to={ROUTES.LOGIN} replace />;

  const setAt = (i: number, value: string) => {
    const v = value.replace(/\D/g, '');
    if (!v) { const next = [...digits]; next[i] = ''; setDigits(next); return; }
    const next = [...digits];
    v.split('').slice(0, LENGTH - i).forEach((ch, k) => { next[i + k] = ch; });
    setDigits(next);
    const last = Math.min(i + v.length, LENGTH - 1);
    refs.current[last]?.focus();
    if (next.every(Boolean)) submit(next.join(''));
  };

  const resend = async () => {
    const result = await dispatch(resendOTP(email));
    if (resendOTP.fulfilled.match(result)) { toast.success('A new code is on its way'); setCooldown(60); }
    else toast.error(result.payload?.message ?? 'Could not resend the code');
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><MailCheck className="h-8 w-8" /></div>
      <h1 className="text-3xl font-extrabold">Check your email</h1>
      <p className="mt-2 text-sm text-ink-500">We sent a 6-digit code to <b className="text-ink-800">{email}</b>. It expires in 10 minutes.</p>
      <div className="mt-6 text-left"><FormAlert message={error} /></div>
      <div className="mt-4 flex justify-center gap-2 sm:gap-3" onPaste={(e) => { e.preventDefault(); setAt(0, e.clipboardData.getData('text')); }}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={LENGTH} aria-label={`Digit ${i + 1}`}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
            className="h-14 w-11 rounded-xl border border-ink-200 bg-white text-center text-xl font-bold focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 sm:w-12" />
        ))}
      </div>
      <Button size="lg" block className="mt-8" loading={isLoading} disabled={digits.some((d) => !d)} onClick={() => submit(digits.join(''))}>Verify email</Button>
      <p className="mt-6 text-sm text-ink-500">
        Didn’t get it?{' '}
        {cooldown > 0 ? <span>Resend in {cooldown}s</span> : <button onClick={resend} className="font-bold text-brand-700 hover:underline">Resend code</button>}
      </p>
      <p className="mt-3 text-xs text-ink-400">Check your spam folder too. <Link to={ROUTES.REGISTER} className="underline">Use a different email</Link></p>
    </div>
  );
};

export default VerifyOTPPage;
