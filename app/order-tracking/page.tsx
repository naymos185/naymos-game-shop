import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/get-user';
import { ActiveOrdersTracker, type ActiveOrder } from '@/components/customer/ActiveOrdersTracker';
import { OrderTrackingForm } from '@/components/customer/OrderTrackingForm';
import { Sparkles, Search, Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ติดตามออเดอร์ | NayMos GameShop',
  description: 'ตรวจสอบสถานะคำสั่งซื้อ ชำระเงิน และยืนยันการเติมเกม',
};
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>สถานะออเดอร์</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ติดตามออเดอร์
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            ตรวจสอบขั้นตอนการสั่งซื้อ ชำระเงิน และยืนยันรับการเติมเกม
          </p>
        </div>

        {/* Active Orders List */}
        <div className="mb-8">
          <ActiveOrdersTracker initialOrders={activeOrders} />
        </div>

        {/* Fallback Search by order number for guests */}
        <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-xl bg-sky-50 text-sky-600">
              <Search className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              ค้นหาด้วยหมายเลขออเดอร์ (สำหรับผู้ไม่ได้เข้าสู่ระบบ)
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-5">
            หากสั่งซื้อโดยไม่ได้ล็อกอิน สามารถกรอกหมายเลขคำสั่งซื้อเพื่อตรวจดูสถานะได้ที่นี่
          </p>
          <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดฟอร์มค้นหา...</div>}>
            <OrderTrackingForm />
          </Suspense>
        </div>
      </div>
    </CustomerLayout>
  );
}
