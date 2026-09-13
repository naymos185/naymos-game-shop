import { createClient } from '@/lib/supabase/server';

export type AdminPaymentRow = {
  id: string;
  order_id: string;
  provider: string;
  payment_reference: string | null;
  amount: number;
  status: string;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
  order_number?: string;
};

export async function listPaymentsAdmin(limit = 100): Promise<AdminPaymentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, order_id, provider, payment_reference, amount, status, expires_at, paid_at, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const orderIds = [...new Set(data.map((p) => p.order_id))];
  const orderNumbers: Record<string, string> = {};
  if (orderIds.length) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number')
      .in('id', orderIds);
    (orders ?? []).forEach((o) => {
      orderNumbers[o.id] = o.order_number;
    });
  }

  return data.map((p) => ({
    id: p.id,
    order_id: p.order_id,
    provider: p.provider,
    payment_reference: p.payment_reference,
    amount: Number(p.amount),
    status: p.status,
    expires_at: p.expires_at,
    paid_at: p.paid_at,
    created_at: p.created_at,
    order_number: orderNumbers[p.order_id],
  }));
}
