import { createClient } from '@/lib/supabase/server';

export type DailyRow = {
  date: string;
  orders: number;
  revenue: number;
  success: number;
};

export type TopProduct = {
  product_id: string;
  name: string;
  orders: number;
  revenue: number;
};

export type ReportsData = {
  last7Days: DailyRow[];
  topProducts: TopProduct[];
  totalOrders: number;
  totalRevenue: number;
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export async function getReportsData(): Promise<ReportsData> {
  const empty: ReportsData = {
    last7Days: [],
    topProducts: [],
    totalOrders: 0,
    totalRevenue: 0,
  };

  try {
    const supabase = await createClient();
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from('orders')
      .select('status, total, product_id, created_at')
      .gte('created_at', since.toISOString());

    const list = orders ?? [];
    const dayMap = new Map<string, DailyRow>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { date: key, orders: 0, revenue: 0, success: 0 });
    }

    const productMap = new Map<string, { orders: number; revenue: number }>();
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const o of list) {
      const key = dayKey(o.created_at);
      const row = dayMap.get(key);
      const total = Number(o.total || 0);
      totalOrders += 1;
      if (row) {
        row.orders += 1;
        if (['PAID', 'PROCESSING', 'SUCCESS'].includes(o.status)) {
          row.revenue += total;
          totalRevenue += total;
        }
        if (o.status === 'SUCCESS') row.success += 1;
      } else if (['PAID', 'PROCESSING', 'SUCCESS'].includes(o.status)) {
        totalRevenue += total;
      }

      if (o.product_id) {
        const p = productMap.get(o.product_id) ?? { orders: 0, revenue: 0 };
        p.orders += 1;
        if (['PAID', 'PROCESSING', 'SUCCESS'].includes(o.status)) {
          p.revenue += total;
        }
        productMap.set(o.product_id, p);
      }
    }

    const ids = [...productMap.keys()];
    const names: Record<string, string> = {};
    if (ids.length) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', ids);
      (products ?? []).forEach((p) => {
        names[p.id] = p.name;
      });
    }

    const topProducts: TopProduct[] = [...productMap.entries()]
      .map(([product_id, v]) => ({
        product_id,
        name: names[product_id] ?? product_id.slice(0, 8),
        orders: v.orders,
        revenue: v.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      last7Days: [...dayMap.values()],
      topProducts,
      totalOrders,
      totalRevenue,
    };
  } catch {
    return empty;
  }
}
