import type { Metadata } from 'next';
import { listOrdersAdmin } from '@/lib/orders/queries';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';
import { createClient } from '@/lib/supabase/server';
import { MarkPaidButton } from '@/components/admin/MarkPaidButton';

export const metadata: Metadata = { title: 'จัดการออเดอร์' };
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await listOrdersAdmin(100);

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
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      (products ?? []).forEach((p) => {
        names[`p:${p.id}`] = p.name;
      });
    }
  } catch {
    // ignore
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Orders</h1>
        <p className="text-sm text-zinc-500">ออเดอร์ล่าสุด · {orders.length} รายการ</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีออเดอร์ — ลองสร้างจากหน้าเว็บลูกค้า
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">หมายเลข</th>
                <th className="px-4 py-3 font-medium">เกม / แพ็ก</th>
                <th className="px-4 py-3 font-medium">ยอด</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ติดต่อ</th>
                <th className="px-4 py-3 font-medium">เวลา</th>
                <th className="px-4 py-3 font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.map((o) => (
                <tr key={o.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs">{names[`g:${o.game_id}`] ?? '—'}</p>
                    <p className="text-zinc-500 text-xs">{names[`p:${o.product_id}`] ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-red-400">฿{Number(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${orderStatusColor(o.status)}`}>
                      {orderStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {o.contact_email || o.contact_phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === 'PENDING_PAYMENT' ? (
                      <MarkPaidButton orderNumber={o.order_number} />
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
