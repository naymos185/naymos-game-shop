import type { Metadata } from 'next';
import { listProductsAdmin } from '@/lib/admin/products';
import { getAllGamesAdmin } from '@/lib/games/queries';
import { ProductRowActions } from '@/components/admin/ProductRowActions';
import { ProductCreateForm } from '@/components/admin/ProductCreateForm';

export const metadata: Metadata = { title: 'จัดการแพ็กเกจ' };
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, games] = await Promise.all([
    listProductsAdmin(),
    getAllGamesAdmin(),
  ]);

  const byGame = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.game_name ?? 'ไม่ระบุเกม';
    const list = byGame.get(key) ?? [];
    list.push(p);
    byGame.set(key, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Products</h1>
        <p className="text-sm text-zinc-500">
          แยกตามเกม · {products.length} แพ็ก · แก้ไขตัวเลขแล้วคลิกออกข้างนอกเพื่อบันทึก
        </p>
      </div>

      <ProductCreateForm
        games={games.map((g) => ({ id: g.id, name: g.name }))}
      />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีแพ็กเกจ — เพิ่มด้านบน หรือรัน 003_games_seed.sql
        </div>
      ) : (
        <div className="space-y-8">
          {[...byGame.entries()].map(([gameName, items]) => (
            <section key={gameName}>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                {gameName}
                <span className="text-zinc-500 font-normal">({items.length} แพ็ก)</span>
              </h2>
              <div className="rounded-xl border border-zinc-800 overflow-x-auto">
                <table className="w-full text-sm min-w-[720px] table-fixed">
                  <thead className="bg-zinc-900 text-zinc-400 text-left">
                    <tr>
                      <th className="w-[30%] px-4 py-2.5 font-medium">แพ็กเกจ</th>
                      <th className="w-[15%] px-4 py-2.5 font-medium">กำไร</th>
                      <th className="w-[55%] px-4 py-2.5 font-medium">จัดการราคา / สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {items.map((p) => (
                      <tr key={p.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                        <td className="px-4 py-3 text-zinc-200 font-medium truncate" title={p.name}>
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 text-xs font-semibold whitespace-nowrap">
                          ฿{(p.price - p.cost).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <ProductRowActions
                            id={p.id}
                            name={p.name}
                            price={p.price}
                            cost={p.cost}
                            reseller_price={p.reseller_price}
                            is_active={p.is_active}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
