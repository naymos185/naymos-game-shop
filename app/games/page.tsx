import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Gamepad2 } from 'lucide-react';
import type { Metadata } from 'next';
import { MOCK_GAMES } from '@/lib/data/games';

export const metadata: Metadata = {
  title: 'เกมทั้งหมด',
  description: 'รายชื่อเกมทั้งหมดที่สามารถเติมได้ที่ NayMos GameShop',
};

export default function GamesPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">เกมทั้งหมด</h1>
        <p className="text-zinc-400 mb-8">เลือกเกมที่ต้องการเติม — ระบบอัตโนมัติ รวดเร็ว ปลอดภัย</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-red-600/50 transition"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                <Gamepad2 className="h-12 w-12 text-white/80 group-hover:scale-110 transition" />
              </div>
              <div className="p-4">
                <h2 className="font-semibold">{game.name}</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{game.category}</p>
                <p className="text-xs text-red-400 mt-2">{game.packages.length} แพ็กเกจ</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
