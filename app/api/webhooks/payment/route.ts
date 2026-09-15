import { NextResponse } from 'next/server';

/**
 * Production P1: payment gateway / slip service webhook.
 * Verify signature with PAYMENT_WEBHOOK_SECRET before marking paid.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        message: 'PAYMENT_WEBHOOK_SECRET ยังไม่ตั้ง — ยังไม่เปิด webhook จริง',
      },
      { status: 503 }
    );
  }

  const raw = await request.text();
  void raw;

  return NextResponse.json({
    success: false,
    message: 'ยังไม่ได้เชื่อม gateway — ใส่ logic verify ในเฟส P1',
  });
}
