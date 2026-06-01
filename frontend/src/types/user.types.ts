import type { Address } from './common.types';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  is_verified: boolean;
  is_active: boolean;
  address?: Address;
  created_at: string;
  last_login: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}