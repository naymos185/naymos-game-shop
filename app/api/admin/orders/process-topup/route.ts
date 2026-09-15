import { NextResponse } from 'next/server';
import { processTopupForOrder } from '@/lib/orders/process-topup';
import { requireAdmin } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    let orderNumber = String(body.order_number ?? body.orderNumber ?? body.number ?? '').trim();

    if (!orderNumber && (body.orderId || body.id)) {
      const supabase = await createClient();
      const { data: order } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', body.orderId || body.id)
        .maybeSingle();
      if (order?.order_number) {
        orderNumber = order.order_number;
      }
    }

    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุหมายเลขออเดอร์' }, { status: 400 });
    }

    const result = await processTopupForOrder(orderNumber);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
