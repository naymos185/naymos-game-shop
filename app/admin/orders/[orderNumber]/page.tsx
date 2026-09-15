import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';
import { MarkPaidButton } from '@/components/admin/MarkPaidButton';
import { ProcessTopupButton } from '@/components/admin/ProcessTopupButton';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `ออเดอร์ ${decodeURIComponent(orderNumber)}` };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw).trim().toUpperCase();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (!order) notFound();

  const [{ data: game }, { data: product }, { data: payment }] = await Promise.all([
    supabase.from('games').select('name, slug').eq('id', order.game_id).maybeSingle(),
    supabase.from('products').select('name, price').eq('id', order.product_id).maybeSingle(),
    supabase
      .from('payments')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const player = (order.player_data ?? {}) as Record<string, string>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
            ← กลับรายการออเดอร์
          </Link>
          <h1 className="text-xl font-bold text-slate-900 mt-1 font-mono">{order.order_number}</h1>
          <p className="text-sm text-slate-500">
            <span className={orderStatusColor(order.status)}>{orderStatusLabel(order.status)}</span>
            {' · '}
            {new Date(order.created_at).toLocaleString('th-TH')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === 'PENDING_PAYMENT' && (
            <MarkPaidButton orderNumber={order.order_number} />
          )}
          {(order.status === 'PAID' ||
            order.status === 'FAILED' ||
            order.status === 'PROCESSING') && (
            <ProcessTopupButton orderNumber={order.order_number} />
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
          <h2 className="font-semibold text-slate-900">สินค้า</h2>
          <p>
            <span className="text-slate-500">เกม:</span> {game?.name ?? order.game_id}
          </p>
          <p>
            <span className="text-slate-500">แพ็ก:</span> {product?.name ?? order.product_id}
          </p>
          <p>
            <span className="text-slate-500">ยอด:</span>{' '}
            <span className="font-bold text-blue-600">฿{Number(order.total).toLocaleString()}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
          <h2 className="font-semibold text-slate-900">ผู้เล่น / ติดต่อ</h2>
          {Object.entries(player).map(([k, v]) => (
            <p key={k}>
              <span className="text-slate-500">{k}:</span>{' '}
              <span className="font-mono text-slate-800">{v}</span>
            </p>
          ))}
          <p>
            <span className="text-slate-500">อีเมล:</span> {order.contact_email ?? '—'}
          </p>
          <p>
            <span className="text-slate-500">โทร:</span> {order.contact_phone ?? '—'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
        <h2 className="font-semibold text-slate-900">การชำระเงิน / สลิป</h2>
        {!payment ? (
          <p className="text-slate-400">ยังไม่มี payment record</p>
        ) : (
          <>
            <p>
              <span className="text-slate-500">สถานะ:</span> {payment.status}
            </p>
            <p>
              <span className="text-slate-500">Provider:</span> {payment.provider}
            </p>
            {payment.slip_submitted_at ? (
              <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-3 space-y-1">
                <p className="text-xs text-blue-600 font-medium">ลูกค้าแจ้งโอนแล้ว</p>
                {payment.slip_note && (
                  <p className="whitespace-pre-wrap text-slate-700">{payment.slip_note}</p>
                )}
                {payment.slip_url && (
                  <a
                    href={payment.slip_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    เปิดลิงก์สลิป →
                  </a>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs">ยังไม่ส่งสลิป</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
