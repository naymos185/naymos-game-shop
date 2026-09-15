import type { Metadata } from 'next';
import { listPaymentsAdmin } from '@/lib/admin/payments';

export const metadata: Metadata = { title: 'การชำระเงิน' };
export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-blue-100 text-blue-600',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

export default async function AdminPaymentsPage() {
  const payments = await listPaymentsAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500">
          รายการชำระเงิน · {payments.length} รายการ · ดูสลิปแล้วไป Orders เพื่อยืนยัน
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          ยังไม่มีรายการชำระเงิน
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ออเดอร์</th>
                <th className="px-4 py-3 font-medium">ยอด</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">สลิป / แจ้งโอน</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-900">
                    {p.order_number ?? p.order_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600">
                    ฿{p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLE[p.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[220px]">
                    {p.slip_submitted_at ? (
                      <div className="space-y-1">
                        {p.slip_note && <p className="whitespace-pre-wrap">{p.slip_note}</p>}
                        {p.slip_url && (
                          <a
                            href={p.slip_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            เปิดสลิป →
                          </a>
                        )}
                        <p className="text-[10px] text-slate-400">
                          {new Date(p.slip_submitted_at).toLocaleString('th-TH')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.provider}</td>
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
