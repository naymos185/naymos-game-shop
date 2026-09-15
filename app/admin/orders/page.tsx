import Link from 'next/link';
import type { Metadata } from 'next';
import { listOrdersAdmin } from '@/lib/orders/queries';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';
import { createClient } from '@/lib/supabase/server';
import { MarkPaidButton } from '@/components/admin/MarkPaidButton';
import { ProcessTopupButton } from '@/components/admin/ProcessTopupButton';

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
        <h1 className="text-xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">ออเดอร์ล่าสุด · {orders.length} รายการ · กดหมายเลขเพื่อดูรายละเอียด</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          ยังไม่มีออเดอร์ — ลองสร้างจากหน้าเว็บลูกค้า
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
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
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.order_number)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-900 text-xs">{names[`g:${o.game_id}`] ?? '—'}</p>
                    <p className="text-slate-400 text-xs">{names[`p:${o.product_id}`] ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600">฿{Number(o.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${orderStatusColor(o.status)}`}
                    >
                      {orderStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {o.contact_email || o.contact_phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    {o.status === 'PENDING_PAYMENT' && (
                      <MarkPaidButton orderNumber={o.order_number} />
                    )}
                    {(o.status === 'PAID' || o.status === 'FAILED' || o.status === 'PROCESSING') && (
                      <ProcessTopupButton orderNumber={o.order_number} />
                    )}
                    {o.status === 'SUCCESS' && (
                      <span className="text-xs text-emerald-600">เติมแล้ว</span>
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
