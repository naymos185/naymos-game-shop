import type { Metadata } from 'next';
import { listPointBalancesAdmin } from '@/lib/points/queries';
import { AdminPointAdjustModal } from '@/components/admin/AdminPointAdjustModal';

export const metadata: Metadata = { title: 'คะแนนสมาชิก' };
export const dynamic = 'force-dynamic';

export default async function AdminPointsPage() {
  const rows = await listPointBalancesAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">คะแนนสมาชิก (Points)</h1>
        <p className="text-sm text-zinc-500">
          ยอดคะแนนสมาชิก · {rows.length} คน · สามารถเพิ่มหรือหักคะแนนสมาชิกได้โดยตรง
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีคะแนนสมาชิก
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">สมาชิก</th>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">คะแนนคงเหลือ</th>
                <th className="px-4 py-3 font-medium text-right">จัดการคะแนน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.user_id} className="bg-zinc-950/50 hover:bg-zinc-900/30">
                  <td className="px-4 py-3 text-white font-medium">{r.full_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{r.email || '—'}</td>
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {r.balance.toLocaleString()} พ้อย
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminPointAdjustModal user={r} />
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
