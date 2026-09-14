import { createClient } from '@/lib/supabase/server';

export type DashboardStats = {
  salesToday: number;
  profitToday: number;
  ordersToday: number;
  ordersTotal: number;
  successCount: number;
  successRate: number;
  pendingCount: number;
  customerCount: number;
  resellerCount: number;
  adminCount: number;
  gamesActive: number;
  recentOrders: Array<{
    order_number: string;
    status: string;
    total: number;
    created_at: string;
  }>;
};

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    salesToday: 0,
    profitToday: 0,
    ordersToday: 0,
    ordersTotal: 0,
    successCount: 0,
    successRate: 0,
    pendingCount: 0,
    customerCount: 0,
    resellerCount: 0,
    adminCount: 0,
    gamesActive: 0,
    recentOrders: [],
  };

  try {
    const supabase = await createClient();
    const todayStart = startOfTodayISO();

    const [
      { data: todayOrders },
      { count: totalCount },
      { count: successCount },
      { count: pendingCount },
      { data: profiles },
      { count: gamesCount },
      { data: recent },
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('total, status, product_id, created_at')
        .gte('created_at', todayStart),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SUCCESS'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['PENDING_PAYMENT', 'PAID', 'PROCESSING']),
      supabase.from('profiles').select('role'),
      supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('orders')
        .select('order_number, status, total, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    const list = todayOrders ?? [];
    const paidToday = list.filter((o) => ['SUCCESS', 'PAID', 'PROCESSING'].includes(o.status));
    const salesToday = paidToday.reduce((sum, o) => sum + Number(o.total || 0), 0);

    // Calculate Today's Profit: total minus product cost for paid orders
    let profitToday = 0;
    const productIds = [...new Set(paidToday.map((o) => o.product_id).filter(Boolean))];
    if (productIds.length > 0) {
      const { data: prods } = await supabase
        .from('products')
        .select('id, cost')
        .in('id', productIds);
      const costMap: Record<string, number> = {};
      (prods ?? []).forEach((p) => {
        costMap[p.id] = Number(p.cost ?? 0);
      });
      profitToday = paidToday.reduce((sum, o) => {
        const cost = costMap[o.product_id] ?? 0;
        return sum + (Number(o.total || 0) - cost);
      }, 0);
    } else {
      profitToday = salesToday;
    }

    // Role breakdown
    let customerCount = 0;
    let resellerCount = 0;
    let adminCount = 0;
    (profiles ?? []).forEach((p) => {
      if (p.role === 'reseller') resellerCount++;
      else if (p.role === 'admin' || p.role === 'super_admin') adminCount++;
      else customerCount++;
    });

    const ordersToday = list.length;
    const success = successCount ?? 0;
    const total = totalCount ?? 0;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    return {
      salesToday,
      profitToday,
      ordersToday,
      ordersTotal: total,
      successCount: success,
      successRate,
      pendingCount: pendingCount ?? 0,
      customerCount,
      resellerCount,
      adminCount,
      gamesActive: gamesCount ?? 0,
      recentOrders: (recent ?? []).map((o) => ({
        order_number: o.order_number,
        status: o.status,
        total: Number(o.total),
        created_at: o.created_at,
      })),
    };
  } catch {
    return empty;
  }
}
