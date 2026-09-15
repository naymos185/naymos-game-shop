import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getMyPointBalance(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { data } = await supabase
      .from('point_balances')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    return Number(data?.balance ?? 0);
  } catch {
    return 0;
  }
}

export type LedgerRow = {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  created_at: string;
};

export async function getMyPointLedger(limit = 30): Promise<LedgerRow[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('point_ledger')
      .select('id, amount, balance_after, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      balance_after: Number(r.balance_after),
      reason: r.reason,
      created_at: r.created_at,
    }));
  } catch {
    return [];
  }
}

export type AdminPointRow = {
  user_id: string;
  balance: number;
  email?: string | null;
  full_name?: string | null;
};

export async function listPointBalancesAdmin(limit = 50): Promise<AdminPointRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('point_balances')
      .select('user_id, balance')
      .order('balance', { ascending: false })
      .limit(limit);
    if (error || !data) return [];

    const ids = data.map((d) => d.user_id);
    const names: Record<string, { email?: string; full_name?: string }> = {};
    if (ids.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', ids);
      (profiles ?? []).forEach((p) => {
        names[p.id] = { email: p.email, full_name: p.full_name };
      });
    }

    return data.map((d) => ({
      user_id: d.user_id,
      balance: Number(d.balance),
      email: names[d.user_id]?.email,
      full_name: names[d.user_id]?.full_name,
    }));
  } catch {
    return [];
  }
}

export async function awardPointsForOrder(orderId: string): Promise<number> {
  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
    const { data, error } = await supabase.rpc('award_points_for_order', {
      p_order_id: orderId,
    });
    if (error) return 0;
    return Number(data ?? 0);
  } catch {
    return 0;
  }
}
