import { NextResponse } from 'next/server';
import { adminMarkOrderPaid } from '@/lib/payments/mark-paid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? body.number ?? '');
    const result = await adminMarkOrderPaid(orderNumber);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
