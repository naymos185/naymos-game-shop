import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = String(body.order_number ?? '').trim().toUpperCase();
    if (!orderNumber) {
      return NextResponse.json({ success: false, message: 'ไม่มีหมายเลข' }, { status: 400 });
    }
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('cancel_own_order', {
      p_order_number: orderNumber,
    });
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    const result = data as { success?: boolean; message?: string };
    if (!result?.success) {
      return NextResponse.json(
        { success: false, message: result?.message ?? 'ยกเลิกไม่สำเร็จ' },
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
