import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? '').trim().toUpperCase();
    const slipNote = body.slip_note != null ? String(body.slip_note) : null;
    const slipUrl = body.slip_url != null ? String(body.slip_url) : null;

    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'ไม่มีหมายเลขออเดอร์' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('submit_payment_slip', {
      p_order_number: orderNumber,
      p_slip_note: slipNote,
      p_slip_url: slipUrl,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const result = data as { success?: boolean; message?: string };
    if (!result?.success) {
      return NextResponse.json(
        { success: false, message: result?.message ?? 'ส่งไม่สำเร็จ' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
