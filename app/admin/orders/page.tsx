import type { Metadata } from 'next';
import { listOrdersAdmin } from '@/lib/orders/queries';
import { createClient } from '@/lib/supabase/server';
import { AdminOrderRowActions } from '@/components/admin/AdminOrderRowActions';

export const metadata: Metadata = { title: 'จัดการออเดอร์' };
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await listOrdersAdmin(150);

  const gameIds = [...new Set(orders.map((o) => o.game_id).filter(Boolean))];
  const productIds = [...new Set(orders.map((o) => o.product_id).filter(Boolean))];

  const names: Record<string, string> = {};
  try {
    const supabase = await createClient();
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
  } catch {
    // ignore
  }

  // Filter into 3 separate categories
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'PENDING_PAYMENT');
  const processingOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'PROCESSING');
  const completedOrders = orders.filter((o) => o.status === 'SUCCESS' || o.status === 'completed');
  const otherOrders = orders.filter(
    (o) => !['pending', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SUCCESS', 'completed'].includes(o.status)
  );

  function renderOrderCard(o: any) {
    const gName = names[`g:${o.game_id}`] ?? 'เกม';
    const pName = names[`p:${o.product_id}`] ?? 'แพ็กเกจ';
    const pd = (o.player_data as Record<string, any>) || {};
    const slip = pd.slip_image || pd.payment_slip || null;

    return (
      <div key={o.id} className="rounded-xl border border-sky-100 bg-white/80 p-4 space-y-3 shadow-sm hover:border-sky-200 transition">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-mono text-xs font-bold text-white block">{o.order_number}</span>
            <span className="text-[11px] text-slate-500">{gName} · {pName}</span>
          </div>
          <span className="font-mono font-bold text-sm text-sky-600">฿{Number(o.total || o.amount).toLocaleString()}</span>
        </div>

        {/* Player Data */}
        <div className="rounded-lg bg-slate-50/70 p-2.5 text-xs text-slate-700 font-mono space-y-1">
          {Object.entries(pd)
            .filter(([k]) => !['slip_image', 'payment_slip', 'customer_confirmed', 'confirmed_at', 'cancelled_at', 'cancelled_by'].includes(k))
            .map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-slate-400">{k}:</span>
                <span className="text-white truncate">{String(v)}</span>
              </div>
            ))}
        </div>

        {/* Slip preview if uploaded */}
        {slip && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-medium">สลิปการโอน:</span>
            <a href={slip} target="_blank" rel="noopener noreferrer" className="block w-fit">
              <img src={slip} alt="Slip" className="w-16 h-16 object-cover rounded border border-sky-200 hover:scale-105 transition" />
            </a>
          </div>
        )}

        <div className="pt-2 border-t border-sky-100 flex items-center justify-between gap-2">
          <span suppressHydrationWarning className="text-[10px] text-slate-400">
            {new Date(o.created_at).toLocaleString('th-TH')}
          </span>
          <AdminOrderRowActions order={o} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">จัดการออเดอร์</h1>
        <p className="text-sm text-slate-400">
          แบ่งเป็น 3 หมวดหมู่ชัดเจน: รอชำระเงิน · รอดำเนินการเติม · สำเร็จ
        </p>
      </div>

      {/* 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: รอชำระเงิน */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              1. ช่องรอชำระ ({pendingOrders.length})
            </span>
          </div>
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-600 rounded-xl border border-dashed border-sky-100">
                ไม่มีออเดอร์รอชำระ
              </div>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 2: รอดำเนินการเติม */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-blue-500/10 border border-blue-500/30 px-4 py-2.5">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              2. ช่องรอดำเนินการเติม ({processingOrders.length})
            </span>
          </div>
          <div className="space-y-3">
            {processingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-600 rounded-xl border border-dashed border-sky-100">
                ไม่มีออเดอร์รอดำเนินการ
              </div>
            ) : (
              processingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 3: สำเร็จ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              3. ช่องสำเร็จ ({completedOrders.length})
            </span>
          </div>
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-600 rounded-xl border border-dashed border-sky-100">
                ยังไม่มีออเดอร์สำเร็จ
              </div>
            ) : (
              completedOrders.map(renderOrderCard)
            )}
          </div>
        </div>
      </div>

      {/* Others (e.g. CANCELLED / FAILED) */}
      {otherOrders.length > 0 && (
        <div className="pt-6 border-t border-sky-100">
          <h2 className="text-sm font-semibold text-slate-500 mb-3">ออเดอร์ที่ถูกยกเลิก / อื่นๆ ({otherOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherOrders.map(renderOrderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
