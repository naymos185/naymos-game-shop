import type { Metadata } from 'next';
import { listProductsAdmin } from '@/lib/admin/products';

export const metadata: Metadata = { title: 'จัดการแพ็กเกจ' };
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await listProductsAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <p className="text-sm text-zinc-500">
          แพ็กเกจจากฐานข้อมูล · {products.length} รายการ
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีแพ็กเกจ — รัน 003_games_seed.sql
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">เกม</th>
                <th className="px-4 py-3 font-medium">แพ็กเกจ</th>
                <th className="px-4 py-3 font-medium">ราคา</th>
                <th className="px-4 py-3 font-medium">ต้นทุน</th>
                <th className="px-4 py-3 font-medium">กำไร</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((p) => {
                const profit = p.price - p.cost;
                return (
                  <tr key={p.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-white text-xs">{p.game_name ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-200">{p.name}</td>
                    <td className="px-4 py-3 font-medium text-red-400">
                      ฿{p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">฿{p.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400">
                      ฿{profit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                          p.is_active
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {p.is_active ? 'เปิด' : 'ปิด'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-zinc-600 mt-4">
        โหมดดูอย่างเดียว · เพิ่ม/แก้ไขแพ็กเกจผ่าน UI จะทำในเฟสถัดไป
      </p>
    </div>
  );
}
