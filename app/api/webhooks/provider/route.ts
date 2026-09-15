import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * P2 — Provider status webhook
 * Header: x-webhook-secret = PROVIDER_WEBHOOK_SECRET
 * Body: { "order_number": "NM-...", "status": "SUCCESS" | "FAILED", "note"?: "..." }
 */
export async function POST(request: Request) {
  const secret = process.env.PROVIDER_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, message: 'ยังไม่ตั้ง PROVIDER_WEBHOOK_SECRET' },
      { status: 503 }
    );
  }

  const headerSecret =
    request.headers.get('x-webhook-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (headerSecret !== secret) {
    return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
  }

  let body: { order_number?: string; status?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'invalid json' }, { status: 400 });
  }

  const orderNumber = String(body.order_number ?? '').trim().toUpperCase();
  const status = String(body.status ?? '').toUpperCase();
  if (!orderNumber || !['SUCCESS', 'FAILED'].includes(status)) {
    return NextResponse.json(
      { success: false, message: 'ต้องมี order_number และ status SUCCESS|FAILED' },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออเดอร์' }, { status: 404 });
    }

    const note = body.note ? String(body.note).slice(0, 500) : null;
    await admin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(note ? { notes: note } : {}),
      })
      .eq('id', order.id);

    return NextResponse.json({ success: true, message: `อัปเดตเป็น ${status}` });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'error' },
      { status: 500 }
    );
  }
}
