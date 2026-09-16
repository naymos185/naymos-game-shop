import type { Metadata } from 'next';
import { getAllProductCategoriesAdmin } from '@/lib/categories/queries';
import { getAllGamesAdmin } from '@/lib/games/queries';
import { CategoryManager } from '@/components/admin/CategoryManager';

export const metadata: Metadata = { title: 'จัดการหมวดหมู่สินค้า' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const [categories, games] = await Promise.all([
    getAllProductCategoriesAdmin(),
    getAllGamesAdmin(),
  ]);

  // Count games per category
  const usage: Record<string, number> = {};
  games.forEach((g) => {
    if (g.product_category_id) {
      usage[g.product_category_id] = (usage[g.product_category_id] ?? 0) + 1;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Product Categories</h1>
        <p className="text-sm text-zinc-500">
          จัดการหมวดหมู่สินค้า · {categories.length} รายการ · เพิ่มได้จากหลังบ้าน
        </p>
      </div>

      <CategoryManager categories={categories} usage={usage} games={games} />
    </div>
  );
}
