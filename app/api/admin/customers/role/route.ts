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
    const { userId, role } = await request.json();
    if (!userId || !['customer', 'reseller', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
