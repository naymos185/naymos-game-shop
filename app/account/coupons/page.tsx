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
  min_order: number | null;
  is_active: boolean;
  ends_at: string | null;
};

export default async function AccountCouponsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/coupons');

  let coupons: Coupon[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('coupons')
      .select(
        'id, code, description, discount_type, discount_value, min_order, is_active, ends_at'
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(30);
    coupons = (data ?? []) as Coupon[];
    const now = Date.now();
    coupons = coupons.filter((c) => !c.ends_at || new Date(c.ends_at).getTime() > now);
  } catch {
    coupons = [];
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900">
          <Ticket className="h-6 w-6 text-blue-600" />
          คูปองที่ใช้ได้
        </h1>
        <p className="text-sm text-slate-500 mb-6">คัดลอกโค้ดไปใส่ตอนสั่งซื้อ</p>

        {coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            ยังไม่มีคูปองที่ใช้งานได้
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
                <p className="font-mono font-bold text-blue-600 text-lg">{c.code}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {c.discount_type === 'percent'
                    ? `ลด ${c.discount_value}%`
                    : `ลด ฿${c.discount_value}`}
                  {c.min_order ? ` · ขั้นต่ำ ฿${c.min_order}` : ''}
                </p>
                {c.description && (
                  <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
