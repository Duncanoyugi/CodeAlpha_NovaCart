import { useGetProfileQuery as useRawProfile } from '../api/userApi';
import type { User } from '../../../types';

type Flat = User & { address_line1?: string; address_line2?: string; city?: string; state?: string; postal_code?: string; country?: string };

/** Profile endpoint returns flat address fields; expose them with a proper type. */
export const useGetProfileQuery = () => {
  const result = useRawProfile();
  return { ...result, data: result.data as Flat | undefined };
};
