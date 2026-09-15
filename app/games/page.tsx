import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { GameGrid } from '@/components/customer/GameGrid';
import type { Metadata } from 'next';
import { getActiveGames } from '@/lib/games/queries';

export const metadata: Metadata = {
  title: 'เกมทั้งหมด',
  description: 'รายชื่อเกมทั้งหมดที่สามารถเติมได้ที่ NayMos GameShop',
};

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const games = await getActiveGames();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">เกมทั้งหมด</h1>
        <p className="mb-8 text-zinc-400">เลือกเกมที่ต้องการเติม — ระบบอัตโนมัติ รวดเร็ว ปลอดภัย</p>
        <GameGrid games={games} />
      </div>
    </CustomerLayout>
  );
}
