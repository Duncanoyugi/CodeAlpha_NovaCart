import { useAppDispatch } from '../../../redux/hooks';
import { verifyOTP, resendOTP } from '../../../redux/slices/authSlice';

export const useOTP = () => {
  const dispatch = useAppDispatch();

  return {
    verifyOTP: (email: string, otp_code: string) => dispatch(verifyOTP({ email, otp_code })),
    resendOTP: (email: string) => dispatch(resendOTP(email)),
  };
};