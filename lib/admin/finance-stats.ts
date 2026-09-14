import { createClient } from '@/lib/supabase/server';

export type FinanceStats = {
  revenuePaid: number;
  revenueSuccess: number;
  costEstimate: number;
  grossProfit: number;
  ordersPaid: number;
  ordersSuccess: number;
  pendingPayment: number;
  byStatus: Array<{ status: string; count: number; total: number }>;
};

export async function getFinanceStats(): Promise<FinanceStats> {
  const empty: FinanceStats = {
    revenuePaid: 0,
    revenueSuccess: 0,
    costEstimate: 0,
    grossProfit: 0,
    ordersPaid: 0,
    ordersSuccess: 0,
    pendingPayment: 0,
    byStatus: [],
  };

  try {
    const supabase = await createClient();
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total, product_id');

    if (!orders?.length) return empty;

    const productIds = [...new Set(orders.map((o) => o.product_id).filter(Boolean))];
    const costMap: Record<string, number> = {};
    if (productIds.length) {
      const { data: products } = await supabase
        .from('products')
        .select('id, cost')
        .in('id', productIds);
      (products ?? []).forEach((p) => {
        costMap[p.id] = Number(p.cost ?? 0);
      });
    }

    const byStatusMap = new Map<string, { count: number; total: number }>();
    let revenuePaid = 0;
    let revenueSuccess = 0;
    let costEstimate = 0;
    let ordersPaid = 0;
    let ordersSuccess = 0;
    let pendingPayment = 0;

    for (const o of orders) {
      const total = Number(o.total || 0);
      const st = o.status as string;
      const cur = byStatusMap.get(st) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += total;
      byStatusMap.set(st, cur);

      if (st === 'PENDING_PAYMENT') pendingPayment += 1;
      if (['PAID', 'PROCESSING', 'SUCCESS'].includes(st)) {
        revenuePaid += total;
        ordersPaid += 1;
        costEstimate += costMap[o.product_id] ?? 0;
      }
      if (st === 'SUCCESS') {
        revenueSuccess += total;
        ordersSuccess += 1;
      }
    }

    return {
      revenuePaid,
      revenueSuccess,
      costEstimate,
      grossProfit: revenuePaid - costEstimate,
      ordersPaid,
      ordersSuccess,
      pendingPayment,
      byStatus: [...byStatusMap.entries()]
        .map(([status, v]) => ({ status, count: v.count, total: v.total }))
        .sort((a, b) => b.total - a.total),
    };
  } catch {
    return empty;
  }
}
