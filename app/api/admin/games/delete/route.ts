import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ id เกม' }, { status: 400 });
    }

    // Try service role client first if available, otherwise server cookie client
    const supabaseAdmin = createAdminClient();
    
    // Delete game_fields & products first to avoid foreign key issues
    await supabaseAdmin.from('game_fields').delete().eq('game_id', id);
    await supabaseAdmin.from('products').delete().eq('game_id', id);
    
    let { error } = await supabaseAdmin.from('games').delete().eq('id', id);

    // If hard delete fails (e.g. permission or order history fkey), fallback to soft-delete (deactivate)
    if (error) {
      const serverClient = await createClient();
      const fallback = await serverClient
        .from('games')
        .update({ is_active: false })
        .eq('id', id);

      if (fallback.error) {
        return NextResponse.json({ success: false, message: error.message || fallback.error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'ปิดการใช้งานเกมเรียบร้อย (เนื่องจากมีประวัติหรือติดสิทธิ์ฐานข้อมูล)' });
    }

    return NextResponse.json({ success: true, message: 'ลบเกมสำเร็จ' });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
