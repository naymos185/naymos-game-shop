import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { getActiveGames, getProductCategories } from '@/lib/games/queries';
import { GameCategorySection } from '@/components/customer/GameCategorySection';

export const metadata: Metadata = {
  title: 'รายการทั้งหมด | NayMos GameShop',
  description: 'รายการสินค้าและบริการทั้งหมดที่ NayMos GameShop สะดวก รวดเร็ว ปลอดภัย 100% ให้บริการ 24 ชม.',
};

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const [games, categories] = await Promise.all([
    getActiveGames(),
    getProductCategories(),
  ]);

  return (
    <CustomerLayout>
      <div className="py-6 sm:py-8">
        <GameCategorySection
          games={games}
          categories={categories}
          title="รายการทั้งหมด"
          subtitle="เลือกสินค้าหรือบริการที่คุณต้องการ — ระบบอัตโนมัติ รวดเร็ว ปลอดภัย 100%"
          showViewAll={false}
        />
      </div>
    </CustomerLayout>
  );
}
