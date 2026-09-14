import { createClient } from '@/lib/supabase/server';

export type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export async function listCouponsAdmin(): Promise<AdminCoupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discount_type: c.discount_type,
    discount_value: Number(c.discount_value),
    min_order_amount: Number(c.min_order_amount ?? 0),
    max_uses: c.max_uses,
    used_count: c.used_count ?? 0,
    is_active: c.is_active,
    expires_at: c.expires_at,
    created_at: c.created_at,
  }));
}
