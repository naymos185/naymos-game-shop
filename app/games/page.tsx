import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Gamepad2, ChevronRight, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import { getActiveGames } from '@/lib/games/queries';

export const metadata: Metadata = {
  title: 'เกมทั้งหมด | NayMos GameShop',
  description: 'รายชื่อเกมทั้งหมดที่สามารถเติมได้ที่ NayMos GameShop เติมง่าย ไว ปลอดภัย 100%',
};

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const games = await getActiveGames();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2">
              ✨ รายการเกมทั้งหมด
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">เลือกเกมที่ต้องการเติม</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">ระบบเติมเกมอัตโนมัติ รวดเร็ว ปลอดภัย 100% ให้บริการ 24 ชม.</p>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-white border border-sky-200 rounded-full px-4 py-2 self-start sm:self-auto shadow-2xs">
            พร้อมให้บริการ {games.length} เกม
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group flex flex-col rounded-3xl border border-sky-100 bg-white p-3 hover:border-sky-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="aspect-square rounded-2xl bg-sky-50 overflow-hidden relative mb-2.5 border border-sky-50 shadow-inner">
                {game.icon || game.banner ? (
                  <img
                    src={game.banner || game.icon || ''}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200">
                    <Gamepad2 className="h-10 w-10 text-sky-500 group-hover:scale-110 transition" />
                  </div>
                )}
                <span className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-sky-800 shadow-2xs">
                  {game.category || 'Game'}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-extrabold text-sm text-slate-800 truncate group-hover:text-sky-600 transition">{game.name}</h2>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{game.products?.length || 0} แพ็กเกจ</p>
                </div>
                <div className="mt-3">
                  <span className="w-full inline-flex items-center justify-center rounded-full bg-sky-50 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-blue-600 border border-sky-200 group-hover:border-transparent py-1.5 text-xs font-bold text-sky-700 group-hover:text-white transition duration-200">
                    เติมเกม
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
