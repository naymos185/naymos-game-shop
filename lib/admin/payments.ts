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
  slip_note?: string | null;
  slip_url?: string | null;
  slip_submitted_at?: string | null;
};

export async function listPaymentsAdmin(limit = 100): Promise<AdminPaymentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id, order_id, provider, payment_reference, amount, status, expires_at, paid_at, created_at, slip_note, slip_url, slip_submitted_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    const { data: data2, error: e2 } = await supabase
      .from('payments')
      .select(
        'id, order_id, provider, payment_reference, amount, status, expires_at, paid_at, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(limit);
    if (e2 || !data2) return [];
    const orderIds = [...new Set(data2.map((p) => p.order_id))];
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
    return data2.map((p) => ({
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
    slip_note: (p as { slip_note?: string }).slip_note,
    slip_url: (p as { slip_url?: string }).slip_url,
    slip_submitted_at: (p as { slip_submitted_at?: string }).slip_submitted_at,
  }));
}
