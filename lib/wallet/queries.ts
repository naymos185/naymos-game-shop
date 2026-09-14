import { createClient } from '@/lib/supabase/server';

export async function getMyWalletBalance(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    return Number(data?.balance ?? 0);
  } catch {
    return 0;
  }
}

export type WalletLedgerRow = {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  created_at: string;
};

export async function getMyWalletLedger(limit = 30): Promise<WalletLedgerRow[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('wallet_ledger')
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

export type AdminWalletRow = {
  user_id: string;
  balance: number;
  email?: string | null;
  full_name?: string | null;
};

export async function listWalletsAdmin(limit = 50): Promise<AdminWalletRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('wallets')
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
