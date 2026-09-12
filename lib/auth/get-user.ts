import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/user';

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      email: user.email ?? null,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      phone: null,
      role: 'customer',
      avatar_url: null,
    };
  }

  return data as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return profile;
}
