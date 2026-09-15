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
        <p className="text-sm text-slate-400">
          จัดการโค้ดส่วนลด · {coupons.length} รายการ
        </p>
      </div>

      <CouponCreateForm />

      {coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 p-8 text-center text-sm text-slate-400">
          ยังไม่มีคูปอง — รัน 009_coupons.sql หรือสร้างด้านบน
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-white text-slate-500 text-left">
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
                <tr key={c.id} className="bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-slate-900">{c.code}</p>
                    {c.description && (
                      <p className="text-xs text-slate-400">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sky-600">
                    {c.discount_type === 'percent'
                      ? `${c.discount_value}%`
                      : `฿${c.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">฿{c.min_order_amount}</td>
                  <td className="px-4 py-3 text-slate-700">
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
