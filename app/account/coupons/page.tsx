import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';
import { Ticket } from 'lucide-react';

export const metadata: Metadata = { title: 'คูปอง' };
export const dynamic = 'force-dynamic';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  is_active: boolean;
  expires_at: string | null;
};

export default async function AccountCouponsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/coupons');

  let coupons: Coupon[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('coupons')
      .select(
        'id, code, description, discount_type, discount_value, min_order_amount, is_active, expires_at'
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      loadError = error.message;
      coupons = [];
    } else {
      const now = Date.now();
      coupons = ((data ?? []) as Coupon[]).filter(
        (c) => !c.expires_at || new Date(c.expires_at).getTime() > now
      );
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'โหลดไม่สำเร็จ';
    coupons = [];
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <nav className="text-sm text-slate-400 mb-6">
          <Link href="/account" className="hover:text-blue-600">
            บัญชีของฉัน
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-600">คูปอง</span>
        </nav>

        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900">
          <Ticket className="h-6 w-6 text-blue-600" />
          คูปองที่ใช้ได้
        </h1>
        <p className="text-sm text-slate-500 mb-6">คัดลอกโค้ดไปใส่ตอนสั่งซื้อ</p>

        {loadError && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
            โหลดคูปองมีปัญหา: {loadError}
          </div>
        )}

        {coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            ยังไม่มีคูปองที่ใช้งานได้
            <p className="text-xs mt-2 text-slate-400">
              แอดมินสร้างได้ที่ Admin → คูปอง (เช่น NAYMOS10 / SAVE20)
            </p>
            <div className="mt-3">
              <Link href="/games" className="text-blue-600 hover:underline">
                ไปเติมเกม →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {coupons.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-mono font-bold text-blue-600 text-lg select-all">{c.code}</p>
                <p className="text-sm text-slate-700 mt-1">
                  {c.discount_type === 'percent'
                    ? `ลด ${c.discount_value}%`
                    : `ลด ฿${Number(c.discount_value).toLocaleString()}`}
                  {Number(c.min_order_amount) > 0
                    ? ` · ขั้นต่ำ ฿${Number(c.min_order_amount).toLocaleString()}`
                    : ''}
                </p>
                {c.description && (
                  <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                )}
                {c.expires_at && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    หมดอายุ {new Date(c.expires_at).toLocaleString('th-TH')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
