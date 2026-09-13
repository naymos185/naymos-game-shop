import type { Metadata } from 'next';
import { listPaymentsAdmin } from '@/lib/admin/payments';

export const metadata: Metadata = { title: 'การชำระเงิน' };
export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400',
  PAID: 'bg-emerald-500/15 text-emerald-400',
  EXPIRED: 'bg-zinc-700 text-zinc-400',
  FAILED: 'bg-red-500/15 text-red-400',
  REFUNDED: 'bg-blue-500/15 text-blue-400',
  CANCELLED: 'bg-zinc-700 text-zinc-400',
};

export default async function AdminPaymentsPage() {
  const payments = await listPaymentsAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Payments</h1>
        <p className="text-sm text-zinc-500">
          รายการชำระเงิน · {payments.length} รายการ
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีรายการชำระเงิน — สร้างออเดอร์แล้วเปิดหน้าชำระเงิน
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ออเดอร์</th>
                <th className="px-4 py-3 font-medium">ยอด</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">รหัสอ้างอิง</th>
                <th className="px-4 py-3 font-medium">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {payments.map((p) => (
                <tr key={p.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono text-xs text-white">
                    {p.order_number ?? p.order_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-red-400">
                    ฿{p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLE[p.status] ?? 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{p.provider}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">
                    {p.payment_reference ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleString('th-TH')}
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
