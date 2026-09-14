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
    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ success: false, message: 'ไม่มี id' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    return NextResponse.json({ success: true, message: 'ลบคูปองสำเร็จ' });
  } catch (e) {
    return NextResponse.json({ success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' }, { status: 500 });
  }
}
