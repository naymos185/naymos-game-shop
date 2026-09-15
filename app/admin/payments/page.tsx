import type { Metadata } from 'next';
import { listPaymentsAdmin } from '@/lib/admin/payments';

export const metadata: Metadata = { title: 'การชำระเงิน' };
export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400',
  PAID: 'bg-emerald-500/15 text-emerald-400',
  EXPIRED: 'bg-sky-100 text-slate-500',
  FAILED: 'bg-sky-50 text-sky-600',
  REFUNDED: 'bg-blue-500/15 text-blue-400',
  CANCELLED: 'bg-sky-100 text-slate-500',
};

export default async function AdminPaymentsPage() {
  const payments = await listPaymentsAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Payments</h1>
        <p className="text-sm text-slate-400">
          รายการชำระเงิน · {payments.length} รายการ
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/80 p-10 text-center text-sm text-slate-400">
          ยังไม่มีรายการชำระเงิน — สร้างออเดอร์แล้วเปิดหน้าชำระเงิน
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-white text-slate-500 text-left">
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
                <tr key={p.id} className="bg-slate-50/50 hover:bg-white/80">
                  <td className="px-4 py-3 font-mono text-xs text-slate-800">
                    {p.order_number ?? p.order_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-sky-600">
                    ฿{p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLE[p.status] ?? 'bg-sky-100 text-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.provider}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    {p.payment_reference ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
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
