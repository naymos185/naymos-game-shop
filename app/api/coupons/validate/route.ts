import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons/validate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body.code ?? '');
    const subtotal = Number(body.subtotal ?? 0);
    const result = await validateCoupon(code, subtotal);
    if (!result.valid) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, coupon: result });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
