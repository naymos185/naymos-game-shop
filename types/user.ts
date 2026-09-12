export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
}
