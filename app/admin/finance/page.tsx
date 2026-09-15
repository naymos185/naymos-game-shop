import type { Metadata } from 'next';
import { getFinanceStats } from '@/lib/admin/finance-stats';

export const metadata: Metadata = { title: 'การเงิน' };
export const dynamic = 'force-dynamic';

function baht(n: number) {
  return `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

export default async function AdminFinancePage() {
  const s = await getFinanceStats();

  const cards = [
    { label: 'รายได้ (ชำระแล้วขึ้นไป)', value: baht(s.revenuePaid), sub: `${s.ordersPaid} ออเดอร์` },
    { label: 'รายได้ (สำเร็จ)', value: baht(s.revenueSuccess), sub: `${s.ordersSuccess} ออเดอร์` },
    { label: 'ต้นทุนโดยประมาณ', value: baht(s.costEstimate), sub: 'จาก cost แพ็ก' },
    {
      label: 'กำไรขั้นต้น (โดยประมาณ)',
      value: baht(s.grossProfit),
      sub: s.grossProfit >= 0 ? 'รายได้ − ต้นทุน' : 'ติดลบ',
    },
    { label: 'รอชำระ', value: String(s.pendingPayment), sub: 'PENDING_PAYMENT' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Finance</h1>
        <p className="text-sm text-slate-400">สรุปยอดจากออเดอร์จริง · ไม่ใช่บัญชีธนาคาร</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-sky-100 bg-slate-50/50 p-4"
          >
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold mb-3 text-sm">แยกตามสถานะ</h2>
      {s.byStatus.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 p-8 text-center text-sm text-slate-400">
          ยังไม่มีออเดอร์
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-white text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">จำนวน</th>
                <th className="px-4 py-3 font-medium">ยอดรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {s.byStatus.map((r) => (
                <tr key={r.status} className="bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{r.status}</td>
                  <td className="px-4 py-3 text-slate-800">{r.count}</td>
                  <td className="px-4 py-3 text-sky-600 font-medium">{baht(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
