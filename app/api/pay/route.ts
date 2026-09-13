import { NextResponse } from 'next/server';
import { ensurePaymentForOrder } from '@/lib/payments/create-payment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number') ?? searchParams.get('order_number') ?? '';
    if (!number.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุหมายเลขออเดอร์' }, { status: 400 });
    }
    const result = await ensurePaymentForOrder(number);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
