import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processTopupForOrder } from '@/lib/orders/process-topup';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? body.number ?? '')
      .trim()
      .toUpperCase();
    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'ไม่มีหมายเลขออเดอร์' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'ต้องล็อกอิน' }, { status: 401 });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, total')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ success: false, message: 'ไม่พบออเดอร์' }, { status: 404 });
    }
    if (order.user_id !== user.id) {
      return NextResponse.json({ success: false, message: 'ไม่ใช่ออเดอร์ของคุณ' }, { status: 403 });
    }

    const { data, error } = await supabase.rpc('pay_order_with_wallet', {
      p_order_id: order.id,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const result = data as { success?: boolean; message?: string; balance?: number };
    if (!result?.success) {
      return NextResponse.json(
        { success: false, message: result?.message ?? 'ชำระด้วย Wallet ไม่สำเร็จ' },
        { status: 400 }
      );
    }

    try {
      await processTopupForOrder(orderNumber);
    } catch {
      /* best-effort */
    }

    return NextResponse.json({
      success: true,
      balance: result.balance,
      order_number: orderNumber,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
