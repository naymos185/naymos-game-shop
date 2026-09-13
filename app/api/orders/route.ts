import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders/create-order';
import { getOrderByNumber } from '@/lib/orders/queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createOrder({
      game_id: String(body.game_id ?? ''),
      product_id: String(body.product_id ?? ''),
      player_data: (body.player_data ?? {}) as Record<string, string>,
      contact_email: body.contact_email ? String(body.contact_email) : undefined,
      contact_phone: body.contact_phone ? String(body.contact_phone) : undefined,
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

    return NextResponse.json({ success: true, order });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
