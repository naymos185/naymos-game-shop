import { createClient } from '@/lib/supabase/server';

export type DashboardStats = {
  salesToday: number;
  ordersToday: number;
  ordersTotal: number;
  successCount: number;
  successRate: number;
  pendingCount: number;
  customers: number;
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
    ordersToday: 0,
    ordersTotal: 0,
    successCount: 0,
    successRate: 0,
    pendingCount: 0,
    customers: 0,
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
      { count: customerCount },
      { count: gamesCount },
      { data: recent },
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('total, status, created_at')
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
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
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
    const salesToday = list
      .filter((o) => ['SUCCESS', 'PAID', 'PROCESSING'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const ordersToday = list.length;
    const success = successCount ?? 0;
    const total = totalCount ?? 0;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    return {
      salesToday,
      ordersToday,
      ordersTotal: total,
      successCount: success,
      successRate,
      pendingCount: pendingCount ?? 0,
      customers: customerCount ?? 0,
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
