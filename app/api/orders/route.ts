import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders/create-order';
import { getOrderByNumber } from '@/lib/orders/queries';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createOrder({
      game_id: String(body.game_id ?? ''),
      product_id: String(body.product_id ?? ''),
      player_data: (body.player_data ?? {}) as Record<string, string>,
      contact_email: body.contact_email ? String(body.contact_email) : undefined,
      contact_phone: body.contact_phone ? String(body.contact_phone) : undefined,
      coupon_code: body.coupon_code ? String(body.coupon_code) : undefined,
      points_to_use: body.points_to_use != null ? Number(body.points_to_use) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number') ?? searchParams.get('order_number') ?? '';
    if (!number.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุหมายเลขออเดอร์' }, { status: 400 });
    }

    const order = await getOrderByNumber(number);
    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออเดอร์' }, { status: 404 });
    }

    let events: unknown[] = [];
    try {
      const supabase = await createClient();
      const orderId = (order as { id?: string }).id;
      if (orderId) {
        const { data } = await supabase
          .from('order_events')
          .select('id, from_status, to_status, note, actor, created_at')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });
        events = data ?? [];
      }
    } catch {
      events = [];
    }

    return NextResponse.json({ success: true, order, events });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
