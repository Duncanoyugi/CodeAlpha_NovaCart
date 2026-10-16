import { STORAGE_KEYS } from '../utils/constants';

/** Guest-cart identifier handed out by the API (X-Session-Key header). */
export const sessionService = {
  get: (): string | null => localStorage.getItem(STORAGE_KEYS.SESSION_KEY),
  set: (key: string) => localStorage.setItem(STORAGE_KEYS.SESSION_KEY, key),
  clear: () => localStorage.removeItem(STORAGE_KEYS.SESSION_KEY),
};
