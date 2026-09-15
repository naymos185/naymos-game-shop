import { NextResponse } from 'next/server';

/**
 * Production P2: top-up provider status webhook.
 * Verify PROVIDER_WEBHOOK_SECRET then update order SUCCESS/FAILED.
 */
export async function POST(request: Request) {
  const secret = process.env.PROVIDER_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        message: 'PROVIDER_WEBHOOK_SECRET ยังไม่ตั้ง — ยังไม่เปิด webhook จริง',
      },
      { status: 503 }
    );
  }

  const raw = await request.text();
  void raw;

  return NextResponse.json({
    success: false,
    message: 'ยังไม่ได้เชื่อม provider — ใส่ logic ในเฟส P2',
  });
}
