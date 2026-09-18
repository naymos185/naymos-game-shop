import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const orderId = body.id || body.orderId;
    const orderNumber = String(body.order_number ?? body.orderNumber ?? '').trim().toUpperCase();

    const supabase = createAdminClient();
    const query = supabase.from('orders').select('id, order_number, status');
    if (orderId) {
      query.eq('id', orderId);
    } else if (orderNumber) {
      query.eq('order_number', orderNumber);
    } else {
      return NextResponse.json({ success: false, message: 'กรุณาระบุออเดอร์' }, { status: 400 });
    }

    const { data: order, error } = await query.maybeSingle();
    if (error || !order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออเดอร์' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'QUEUED',
        payment_confirmed_at: now,
        updated_at: now,
      })
      .eq('id', order.id);

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'ยืนยันการชำระเงินและส่งออเดอร์เข้าคิวเรียบร้อยแล้ว',
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
