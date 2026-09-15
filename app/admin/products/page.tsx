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
        <p className="text-sm text-slate-400">
          แยกตามเกม · {products.length} แพ็ก · แก้ไขราคาหรือราคาส่งแล้วคลิกออกข้างนอกเพื่อบันทึก
        </p>
      </div>

      <ProductCreateForm
        games={games.map((g) => ({ id: g.id, name: g.name }))}
      />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/80 p-10 text-center text-sm text-slate-400">
          ยังไม่มีแพ็กเกจ — เพิ่มด้านบน หรือรัน 003_games_seed.sql
        </div>
      ) : (
        <div className="space-y-8">
          {[...byGame.entries()].map(([gameName, items]) => (
            <section key={gameName}>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                {gameName}
                <span className="text-slate-400 font-normal">({items.length} แพ็ก)</span>
              </h2>
              <div className="rounded-xl border border-sky-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[800px] table-fixed">
                  <thead className="bg-white text-slate-500 text-left">
                    <tr>
                      <th className="w-[28%] px-4 py-2.5 font-medium">แพ็กเกจ</th>
                      <th className="w-[14%] px-4 py-2.5 font-medium">กำไรปกติ</th>
                      <th className="w-[14%] px-4 py-2.5 font-medium">กำไรตัวแทน</th>
                      <th className="w-[44%] px-4 py-2.5 font-medium">ราคา / ต้นทุน / ราคาส่ง / จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {items.map((p) => {
                      const normalProfit = p.price - p.cost;
                      const resellerProfit = p.reseller_price != null ? (p.reseller_price - p.cost) : null;

                      return (
                        <tr key={p.id} className="bg-slate-50/50 hover:bg-white/80">
                          <td className="px-4 py-3 text-slate-800 font-medium truncate" title={p.name}>
                            {p.name}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                            <span className={normalProfit >= 0 ? 'text-emerald-400' : 'text-sky-600'}>
                              ฿{normalProfit.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                            {resellerProfit != null ? (
                              <span className={resellerProfit >= 0 ? 'text-emerald-400' : 'text-sky-600'}>
                                ฿{resellerProfit.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">—</span>
                            )}
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
                      );
                    })}
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
