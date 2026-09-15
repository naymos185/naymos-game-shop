import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGamesAdmin } from '@/lib/games/queries';
import { createClient } from '@/lib/supabase/server';
import { GameRowActions } from '@/components/admin/GameRowActions';
import { GameCreateForm } from '@/components/admin/GameCreateForm';

export const metadata: Metadata = { title: 'จัดการเกม' };
export const dynamic = 'force-dynamic';

export default async function AdminGamesPage() {
  const games = await getAllGamesAdmin();

  const counts: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('products').select('game_id');
    (data ?? []).forEach((p) => {
      counts[p.game_id] = (counts[p.game_id] ?? 0) + 1;
    });
  } catch {
    // ignore
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Games</h1>
        <p className="text-sm text-slate-400">
          รายการเกมที่เปิดให้บริการ · {games.length} เกม · เพิ่ม ลบ แก้ไขรูป หรือปรับเปิด/ปิดการขาย
        </p>
      </div>

      <GameCreateForm />

      <div className="rounded-xl border border-sky-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-white text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">รูปภาพ</th>
              <th className="px-4 py-3 font-medium">ชื่อเกม</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">หมวดหมู่</th>
              <th className="px-4 py-3 font-medium">แพ็กเกจ</th>
              <th className="px-4 py-3 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {games.map((g) => (
              <tr key={g.id} className="bg-slate-50/50 hover:bg-white/30">
                <td className="px-4 py-3">
                  {g.icon ? (
                    <img src={g.icon} alt={g.name} className="w-10 h-10 rounded-lg object-cover border border-sky-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-sky-50/80 flex items-center justify-center text-xs text-slate-400">
                      ไม่มีรูป
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-white">{g.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{g.slug}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{g.category || '—'}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products?game_id=${g.id}`}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    {counts[g.id] ?? 0} แพ็กเกจ
                  </Link>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-block">
                    <GameRowActions id={g.id} name={g.name} icon={g.icon} is_active={g.is_active} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
