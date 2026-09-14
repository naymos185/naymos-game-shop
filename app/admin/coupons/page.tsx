import type { Metadata } from 'next';
import { listCouponsAdmin } from '@/lib/admin/coupons';
import { CouponCreateForm } from '@/components/admin/CouponCreateForm';
import { CouponToggle } from '@/components/admin/CouponToggle';

export const metadata: Metadata = { title: 'คูปอง' };
export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await listCouponsAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Coupons</h1>
        <p className="text-sm text-zinc-500">
          จัดการโค้ดส่วนลด · {coupons.length} รายการ
        </p>
      </div>

      <CouponCreateForm />

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
          ยังไม่มีคูปอง — รัน 009_coupons.sql หรือสร้างด้านบน
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">โค้ด</th>
                <th className="px-4 py-3 font-medium">ส่วนลด</th>
                <th className="px-4 py-3 font-medium">ขั้นต่ำ</th>
                <th className="px-4 py-3 font-medium">ใช้แล้ว</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {coupons.map((c) => (
                <tr key={c.id} className="bg-zinc-950/50">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-white">{c.code}</p>
                    {c.description && (
                      <p className="text-xs text-zinc-500">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-red-400">
                    {c.discount_type === 'percent'
                      ? `${c.discount_value}%`
                      : `฿${c.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">฿{c.min_order_amount}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {c.used_count}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <CouponToggle id={c.id} is_active={c.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
