import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth/get-user';
import { listOrdersForCurrentUser } from '@/lib/orders/queries';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'ประวัติออเดอร์' };
export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login?next=/account/orders');
  }

  const orders = await listOrdersForCurrentUser(50);

  const gameIds = [...new Set(orders.map((o) => o.game_id).filter(Boolean))];
  const productIds = [...new Set(orders.map((o) => o.product_id).filter(Boolean))];
  const names: Record<string, string> = {};

  try {
    const supabase = await createClient();
    if (gameIds.length) {
      const { data: games } = await supabase.from('games').select('id, name').in('id', gameIds);
      (games ?? []).forEach((g) => {
        names[`g:${g.id}`] = g.name;
      });
    }
    if (productIds.length) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      (products ?? []).forEach((p) => {
        names[`p:${p.id}`] = p.name;
      });
    }
  } catch {
    // ignore
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <nav className="text-sm text-zinc-500 mb-6">
          <Link href="/account" className="hover:text-red-400">
            บัญชีของฉัน
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">ประวัติออเดอร์</span>
        </nav>

        <h1 className="text-2xl font-bold mb-2">ประวัติออเดอร์</h1>
        <p className="text-zinc-400 text-sm mb-8">
          ออเดอร์ที่สร้างตอนล็อกอิน · {orders.length} รายการ
        </p>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center">
            <p className="text-zinc-400 mb-3">ยังไม่มีออเดอร์</p>
            <p className="text-xs text-zinc-500 mb-6">
              ออเดอร์ที่สั่งแบบ Guest (ไม่ล็อกอิน) จะไม่โผล่ที่นี่
              <br />
              ใช้หน้าติดตามออเดอร์ด้วยหมายเลขแทน
            </p>
            <Link
              href="/games"
              className="inline-flex rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition"
            >
              ไปเลือกเกม
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-white">
                      {o.order_number}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(o.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColor(o.status)}`}
                  >
                    {orderStatusLabel(o.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">เกม</p>
                    <p className="text-white">{names[`g:${o.game_id}`] ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">แพ็กเกจ</p>
                    <p className="text-white">{names[`p:${o.product_id}`] ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">ยอดชำระ</p>
                    <p className="font-bold text-red-400">฿{Number(o.total)}</p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Link
                      href={`/order-tracking?number=${encodeURIComponent(o.order_number)}`}
                      className="text-xs text-red-400 hover:underline"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
