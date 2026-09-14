import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = String(body.user_id ?? '').trim();
    const pointsDelta = Number(body.points); // can be negative for deduct, positive for add
    const description = String(body.description ?? 'แอดมินปรับยอดคะแนน').trim();

    if (!userId || isNaN(pointsDelta) || pointsDelta === 0) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ user_id และจำนวนคะแนนที่ถูกต้อง' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('point_ledger').insert({
      user_id: userId,
      points: pointsDelta,
      description,
      type: pointsDelta > 0 ? 'earn' : 'redeem',
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'ปรับยอดคะแนนสำเร็จ' });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
