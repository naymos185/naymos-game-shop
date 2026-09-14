import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin: ' + (err?.message || '') }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id ?? '').trim();
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ id ออเดอร์' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    // Delete payments first
    await supabaseAdmin.from('payments').delete().eq('order_id', id);
    const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);

    if (error) {
      const serverClient = await createClient();
      await serverClient.from('orders').update({ status: 'CANCELLED' }).eq('id', id);
      return NextResponse.json({ success: false, message: 'ลบไม่สำเร็จ: ' + error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'ลบออเดอร์สำเร็จ' });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
