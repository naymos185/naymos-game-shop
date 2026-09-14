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
          ออเดอร์ทั้งหมด · {orders.length} รายการ
        </p>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
            ยังไม่มีประวัติออเดอร์
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const gName = names[`g:${o.game_id}`] ?? 'เกม';
              const pName = names[`p:${o.product_id}`] ?? 'แพ็กเกจ';
              const isWaitingPayment = o.status === 'pending' || o.status === 'PENDING_PAYMENT';
              const isProcessing = o.status === 'PAID' || o.status === 'PROCESSING';
              const isCompleted = o.status === 'SUCCESS' || o.status === 'completed';

              return (
                <Link
                  key={o.id}
                  href="/order-tracking"
                  className="block rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 p-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isWaitingPayment && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                            ต้องชำระเงิน
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                            รอดำเนินการเติม
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            เติมเสร็จแล้ว
                          </span>
                        )}
                        <span className="font-mono text-sm font-semibold text-white ml-2">
                          {o.order_number}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {gName} · {pName}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {new Date(o.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-bold text-sm text-white">฿{Number(o.total).toLocaleString()}</p>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${orderStatusColor(
                          o.status
                        )}`}
                      >
                        {orderStatusLabel(o.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
