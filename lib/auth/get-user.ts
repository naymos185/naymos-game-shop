import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/user';

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
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
});

export const requireAdmin = cache(async (): Promise<Profile> => {
  const profile = await getProfile();
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return profile;
});
