import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? '').trim().toUpperCase();

    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุหมายเลขออเดอร์' }, { status: 400 });
    }

    const supabase = await createClient();
    const profile = await getProfile();

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, status, player_data')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'ไม่พบหมายเลขออเดอร์นี้' }, { status: 404 });
    }

    // Check ownership if user is logged in
    if (profile && order.user_id && order.user_id !== profile.id) {
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์จัดการออเดอร์นี้' }, { status: 403 });
    }

    // Only allow cancellation for pending / waiting payment orders
    const isCancellable = order.status === 'pending' || order.status === 'PENDING_PAYMENT';
    if (!isCancellable) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถยกเลิกได้ เนื่องจากออเดอร์ได้รับการชำระเงินหรือกำลังดำเนินการแล้ว' },
        { status: 400 }
      );
    }

    const currentData = (order.player_data as Record<string, unknown>) || {};
    const updatedData = {
      ...currentData,
      cancelled_by: 'customer',
      cancelled_at: new Date().toISOString(),
    };

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'CANCELLED',
        player_data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateErr) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถยกเลิกออเดอร์ได้' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว' });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
