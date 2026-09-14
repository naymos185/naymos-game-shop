import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/get-user';
import { ActiveOrdersTracker, type ActiveOrder } from '@/components/customer/ActiveOrdersTracker';
import { OrderTrackingForm } from '@/components/customer/OrderTrackingForm';

export const metadata: Metadata = { title: 'ติดตามออเดอร์' };
export const dynamic = 'force-dynamic';

export default async function OrderTrackingPage() {
  const profile = await getProfile();
  let activeOrders: ActiveOrder[] = [];

  if (profile) {
    try {
      const supabase = await createClient();
      const { data: rawOrders } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, game_id, product_id, player_data')
        .eq('user_id', profile.id)
        .in('status', ['pending', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SUCCESS'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (rawOrders && rawOrders.length > 0) {
        const gameIds = [...new Set(rawOrders.map((o) => o.game_id).filter(Boolean))];
        const productIds = [...new Set(rawOrders.map((o) => o.product_id).filter(Boolean))];
        const names: Record<string, string> = {};

        if (gameIds.length) {
          const { data: games } = await supabase.from('games').select('id, name').in('id', gameIds);
          (games ?? []).forEach((g) => {
            names[`g:${g.id}`] = g.name;
          });
        }
        if (productIds.length) {
          const { data: products } = await supabase.from('products').select('id, name').in('id', productIds);
          (products ?? []).forEach((p) => {
            names[`p:${p.id}`] = p.name;
          });
        }

        activeOrders = rawOrders
          .filter((o) => {
            const pd = (o.player_data as Record<string, unknown>) || {};
            return pd.customer_confirmed !== true;
          })
          .map((o) => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            total: Number(o.total),
            created_at: o.created_at,
            game_name: names[`g:${o.game_id}`] ?? 'เกม',
            product_name: names[`p:${o.product_id}`] ?? 'แพ็กเกจ',
            player_data: (o.player_data as Record<string, unknown>) || {},
          }));
      }
    } catch {
      activeOrders = [];
    }
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">ติดตามออเดอร์</h1>
          <p className="text-sm text-zinc-400">
            ตรวจสอบขั้นตอนการสั่งซื้อ ชำระเงิน และยืนยันรับการเติมเกม
          </p>
        </div>

        {/* Active Orders List */}
        <div className="mb-12">
          <ActiveOrdersTracker initialOrders={activeOrders} />
        </div>

        {/* Fallback Search by order number for guests */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6">
          <h2 className="text-sm font-bold text-zinc-300 mb-1">ค้นหาด้วยหมายเลขออเดอร์ (สำหรับผู้ไม่ได้เข้าสู่ระบบ)</h2>
          <p className="text-xs text-zinc-500 mb-4">หากสั่งซื้อโดยไม่ได้ล็อกอิน สามารถกรอกหมายเลขเพื่อตรวจดูสถานะได้ที่นี่</p>
          <OrderTrackingForm />
        </div>
      </div>
    </CustomerLayout>
  );
}
