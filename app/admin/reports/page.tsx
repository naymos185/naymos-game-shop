import type { Metadata } from 'next';
import { getReportsData } from '@/lib/admin/reports';

export const metadata: Metadata = { title: 'รายงาน' };
export const dynamic = 'force-dynamic';

function baht(n: number) {
  return `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

export default async function AdminReportsPage() {
  const r = await getReportsData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Reports</h1>
        <p className="text-sm text-slate-400">
          7 วันล่าสุด · {r.totalOrders} ออเดอร์ · รายได้ {baht(r.totalRevenue)}
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-3 text-sm">รายวัน (7 วัน)</h2>
        <div className="rounded-xl border border-sky-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="bg-white text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium">ออเดอร์</th>
                <th className="px-4 py-3 font-medium">สำเร็จ</th>
                <th className="px-4 py-3 font-medium">รายได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {r.last7Days.map((d) => (
                <tr key={d.date} className="bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{d.date}</td>
                  <td className="px-4 py-3 text-slate-800">{d.orders}</td>
                  <td className="px-4 py-3 text-emerald-400">{d.success}</td>
                  <td className="px-4 py-3 text-sky-600">{baht(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3 text-sm">แพ็กขายดี (7 วัน)</h2>
        {r.topProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sky-200 p-8 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          <div className="rounded-xl border border-sky-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="bg-white text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">แพ็กเกจ</th>
                  <th className="px-4 py-3 font-medium">ออเดอร์</th>
                  <th className="px-4 py-3 font-medium">รายได้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {r.topProducts.map((p) => (
                  <tr key={p.product_id} className="bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-slate-700">{p.orders}</td>
                    <td className="px-4 py-3 text-sky-600 font-medium">{baht(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
