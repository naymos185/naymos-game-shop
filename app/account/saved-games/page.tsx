import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';
import { Bookmark } from 'lucide-react';

export const metadata: Metadata = { title: 'เกมที่บันทึก' };
export const dynamic = 'force-dynamic';

export default async function SavedGamesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/saved-games');

  const supabase = await createClient();
  let rows: Array<{
    id: string;
    label: string;
    player_data: Record<string, string>;
    game_id: string;
    games?: { name: string; slug: string } | null;
  }> = [];

  try {
    const { data } = await supabase
      .from('saved_players')
      .select('id, label, player_data, game_id, games(name, slug)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    rows = (data ?? []) as typeof rows;
  } catch {
    rows = [];
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900">
          <Bookmark className="h-6 w-6 text-blue-600" />
          บัญชีเกมที่บันทึก
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          บันทึกตอนสั่งซื้อ (สมาชิก) จะโผล่ที่นี่
        </p>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            ยังไม่มีบัญชีที่บันทึก
            <div className="mt-3">
              <Link href="/games" className="text-blue-600 hover:underline">
                ไปเติมเกม →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => {
              const game = Array.isArray(r.games) ? r.games[0] : r.games;
              const pd = r.player_data ?? {};
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-medium text-slate-900">
                    {game?.name ?? 'เกม'} · {r.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {Object.entries(pd)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                  {game?.slug && (
                    <Link
                      href={`/games/${game.slug}`}
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                    >
                      เติมเกมนี้อีก →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
