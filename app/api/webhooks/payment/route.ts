import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processTopupForOrder } from '@/lib/orders/process-topup';

/**
 * P1 — Payment webhook
 * Header: x-webhook-secret = PAYMENT_WEBHOOK_SECRET
 * Body: { "order_number": "NM-...", "status": "PAID" }
 */
export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, message: 'ยังไม่ตั้ง PAYMENT_WEBHOOK_SECRET' },
      { status: 503 }
    );
  }

  const headerSecret =
    request.headers.get('x-webhook-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (headerSecret !== secret) {
    return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
  }

  let body: { order_number?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'invalid json' }, { status: 400 });
  }

  const orderNumber = String(body.order_number ?? '').trim().toUpperCase();
  const status = String(body.status ?? 'PAID').toUpperCase();

  if (!orderNumber) {
    return NextResponse.json({ success: false, message: 'missing order_number' }, { status: 400 });
  }

  if (status !== 'PAID' && status !== 'SUCCESS') {
    return NextResponse.json({ success: true, message: `ignored ${status}` });
  }

  try {
    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from('orders')
      .select('id, status')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออเดอร์' }, { status: 404 });
    }

    if (order.status === 'PENDING_PAYMENT') {
      await admin
        .from('orders')
        .update({ status: 'PAID', updated_at: new Date().toISOString() })
        .eq('id', order.id);
      await admin
        .from('payments')
        .update({ status: 'PAID', updated_at: new Date().toISOString() })
        .eq('order_id', order.id)
        .eq('status', 'PENDING');
    }

    const topup = await processTopupForOrder(orderNumber);
    return NextResponse.json({
      success: true,
      message: topup.success
        ? `ชำระแล้ว · ${topup.message}`
        : `ชำระแล้ว · เติม: ${topup.message}`,
      topup,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'error' },
      { status: 500 }
    );
  }
}
