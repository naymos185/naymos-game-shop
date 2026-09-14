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
        <p className="text-sm text-zinc-500">
          7 วันล่าสุด · {r.totalOrders} ออเดอร์ · รายได้ {baht(r.totalRevenue)}
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-3 text-sm">รายวัน (7 วัน)</h2>
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium">ออเดอร์</th>
                <th className="px-4 py-3 font-medium">สำเร็จ</th>
                <th className="px-4 py-3 font-medium">รายได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {r.last7Days.map((d) => (
                <tr key={d.date} className="bg-zinc-950/50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{d.date}</td>
                  <td className="px-4 py-3 text-white">{d.orders}</td>
                  <td className="px-4 py-3 text-emerald-400">{d.success}</td>
                  <td className="px-4 py-3 text-red-400">{baht(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3 text-sm">แพ็กขายดี (7 วัน)</h2>
        {r.topProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="bg-zinc-900 text-zinc-400 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">แพ็กเกจ</th>
                  <th className="px-4 py-3 font-medium">ออเดอร์</th>
                  <th className="px-4 py-3 font-medium">รายได้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {r.topProducts.map((p) => (
                  <tr key={p.product_id} className="bg-zinc-950/50">
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{p.orders}</td>
                    <td className="px-4 py-3 text-red-400 font-medium">{baht(p.revenue)}</td>
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
