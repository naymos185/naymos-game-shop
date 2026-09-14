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
    const amount = Number(body.amount);
    const reason = body.reason ? String(body.reason) : 'แอดมินเติมเครดิต';

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'ใส่ user_id และจำนวนเงินที่ถูกต้อง' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('admin_credit_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, balance: Number(data) });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
