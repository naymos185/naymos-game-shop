import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? '').trim().toUpperCase();
    const slipBase64 = body.slip_image || body.slip_url;

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
      _slip_url: slipBase64 ? String(slipBase64) : currentData._slip_url,
      slip_image: slipBase64 ? String(slipBase64) : currentData.slip_image,
    };

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'QUEUED',
        payment_confirmed_at: now,
        player_data: updatedData,
        updated_at: now,
      })
      .eq('id', order.id);

    if (updateErr) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถอัปเดตสถานะได้' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'แนบสลิปเรียบร้อยแล้ว ออเดอร์ของคุณเข้าสู่คิวการเติมเรียบร้อยครับ',
      status: 'QUEUED'
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
