import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { GameGrid } from '@/components/customer/GameGrid';
import type { Metadata } from 'next';
import { getActiveGames } from '@/lib/games/queries';
import { getActiveProductCategories } from '@/lib/categories/queries';

export const metadata: Metadata = {
  title: 'รายการทั้งหมด',
  description: 'รายการสินค้าทั้งหมดที่ NayMos GameShop',
};

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const [games, categories] = await Promise.all([
    getActiveGames(),
    getActiveProductCategories(),
  ]);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">รายการทั้งหมด</h1>
        <p className="mb-8 text-zinc-400">เลือกสินค้าที่ต้องการ — ระบบอัตโนมัติ รวดเร็ว ปลอดภัย</p>
        <GameGrid games={games} categories={categories} />
      </div>
    </CustomerLayout>
  );
}
