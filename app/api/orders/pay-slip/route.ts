import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? '').trim().toUpperCase();
    const slipBase64 = body.slip_image;

    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุหมายเลขออเดอร์' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, player_data')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'ไม่พบหมายเลขออเดอร์นี้' }, { status: 404 });
    }

    const currentData = (order.player_data as Record<string, unknown>) || {};
    const updatedData = {
      ...currentData,
      slip_attached: true,
      slip_timestamp: new Date().toISOString(),
      slip_preview: slipBase64 ? String(slipBase64).slice(0, 500) : null,
    };

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'PROCESSING',
        player_data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateErr) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถอัปเดตสถานะได้' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'ยืนยันการแนบสลิปเรียบร้อย สถานะเปลี่ยนเป็นรอดำเนินการเติม' });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
