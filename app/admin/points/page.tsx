import type { Metadata } from 'next';
import { listPointBalancesAdmin } from '@/lib/points/queries';

export const metadata: Metadata = { title: 'คะแนนสมาชิก' };
export const dynamic = 'force-dynamic';

export default async function AdminPointsPage() {
  const rows = await listPointBalancesAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Points</h1>
        <p className="text-sm text-slate-400">
          ยอดคะแนนสมาชิก · {rows.length} คน · 1 คะแนน / 10 บาท (ออเดอร์สำเร็จ)
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 p-10 text-center text-sm text-slate-400">
          ยังไม่มีคะแนน — รัน 012_points.sql แล้วรอออเดอร์สมาชิกสำเร็จ
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-white text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">สมาชิก</th>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">คะแนน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.user_id} className="bg-slate-50/50">
                  <td className="px-4 py-3 text-white">{r.full_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.email || '—'}</td>
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {r.balance.toLocaleString()}
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
