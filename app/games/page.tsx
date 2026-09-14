import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { getActiveGames } from '@/lib/games/queries';
import { GameCategorySection } from '@/components/customer/GameCategorySection';

export const metadata: Metadata = {
  title: 'เกมทั้งหมด | NayMos GameShop',
  description: 'รายชื่อเกมทั้งหมดที่สามารถเติมได้ที่ NayMos GameShop เติมง่าย ไว ปลอดภัย 100%',
};

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const games = await getActiveGames();

  return (
    <CustomerLayout>
      <div className="py-6 sm:py-8">
        <GameCategorySection
          games={games}
          title="รายการเกมทั้งหมด"
          subtitle="ระบบเติมเกมอัตโนมัติ รวดเร็ว ปลอดภัย 100% ให้บริการ 24 ชม."
          showViewAll={false}
        />
      </div>
    </CustomerLayout>
  );
}
