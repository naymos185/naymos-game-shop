import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? '').trim().toUpperCase();

    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุหมายเลขออเดอร์' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, player_data')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'ไม่พบหมายเลขออเดอร์นี้' }, { status: 404 });
    }

    const currentData = (order.player_data as Record<string, unknown>) || {};
    const updatedData = {
      ...currentData,
      customer_confirmed: true,
      confirmed_at: new Date().toISOString(),
    };

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        player_data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateErr) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถยืนยันออเดอร์ได้' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'ยืนยันรับสินค้าเรียบร้อย ย้ายออเดอร์ไปที่ประวัติ' });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
