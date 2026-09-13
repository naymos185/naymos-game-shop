import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGamesAdmin } from '@/lib/games/queries';
import { createClient } from '@/lib/supabase/server';
import { GameRowActions } from '@/components/admin/GameRowActions';

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Games</h1>
          <p className="text-sm text-zinc-500">
            จัดการเกมจากฐานข้อมูล · {games.length} รายการ · เปิด/ปิดได้ทันที
          </p>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center">
          <p className="text-zinc-400 mb-2">ยังไม่มีเกมในฐานข้อมูล</p>
          <p className="text-sm text-zinc-500">
            รันไฟล์ <code className="text-red-400">003_games_seed.sql</code> ใน Supabase SQL Editor
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">เกม</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">แพ็ก</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ลูกค้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {games.map((g) => (
                <tr key={g.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-white font-medium">{g.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{g.slug}</td>
                  <td className="px-4 py-3 text-zinc-300">{counts[g.id] ?? 0}</td>
                  <td className="px-4 py-3">
                    <GameRowActions id={g.id} is_active={g.is_active} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/games/${g.slug}`}
                      className="text-xs text-red-400 hover:underline"
                      target="_blank"
                    >
                      เปิดหน้าลูกค้า →
                    </Link>
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
