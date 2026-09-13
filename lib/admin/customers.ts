import { createClient } from '@/lib/supabase/server';

export type AdminCustomerRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  order_count: number;
};

export async function listCustomersAdmin(limit = 100): Promise<AdminCustomerRow[]> {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !profiles) return [];

  const ids = profiles.map((p) => p.id);
  const counts: Record<string, number> = {};

  if (ids.length) {
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id')
      .in('user_id', ids);
    (orders ?? []).forEach((o) => {
      if (o.user_id) counts[o.user_id] = (counts[o.user_id] ?? 0) + 1;
    });
  }

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    role: p.role ?? 'customer',
    created_at: p.created_at,
    order_count: counts[p.id] ?? 0,
  }));
}
