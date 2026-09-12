import type { Metadata } from 'next';
import { MOCK_GAMES } from '@/lib/data/games';
import Link from 'next/link';

export const metadata: Metadata = { title: 'จัดการเกม' };

export default function AdminGamesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Games</h1>
          <p className="text-sm text-zinc-500">จัดการเกมและแพ็กเกจ (Mock data — Phase 3 จะเชื่อม DB)</p>
        </div>
        <button
          type="button"
          disabled
          className="rounded-lg bg-red-600/50 px-4 py-2 text-sm font-medium text-white cursor-not-allowed"
        >
          + เพิ่มเกม (Phase 3)
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">เกม</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">หมวด</th>
              <th className="px-4 py-3 font-medium">แพ็ก</th>
              <th className="px-4 py-3 font-medium">Fields</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {MOCK_GAMES.map((g) => (
              <tr key={g.slug} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <Link href={`/games/${g.slug}`} className="font-medium text-white hover:text-red-400">
                    {g.name}
                  </Link>
                  <p className="text-xs text-zinc-500">{g.slug}</p>
                </td>
                <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">{g.category}</td>
                <td className="px-4 py-3">{g.packages.length}</td>
                <td className="px-4 py-3 text-zinc-400">{g.fields.map((f) => f.label).join(', ')}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-xs">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
