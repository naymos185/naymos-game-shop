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
      return NextResponse.json({ success: false, message: 'กรุณาระบุ id เกม' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const serverClient = await createClient();

    // 1. Delete or un-link orders referencing this game to avoid foreign key violation
    await supabaseAdmin.from('orders').delete().eq('game_id', id);
    
    // 2. Delete game_fields & products
    await supabaseAdmin.from('game_fields').delete().eq('game_id', id);
    await supabaseAdmin.from('products').delete().eq('game_id', id);
    
    // 3. Delete the game itself
    const { error } = await supabaseAdmin.from('games').delete().eq('id', id);

    if (error) {
      // Fallback: if hard delete fails due to RLS/Postgres constraint, soft-delete it so it disappears
      const fb = await serverClient.from('games').update({ is_active: false }).eq('id', id);
      if (fb.error) {
        return NextResponse.json({ success: false, message: 'ลบไม่สำเร็จ: ' + error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'ปิดการแสดงผลเกมเรียบร้อย' });
    }

    return NextResponse.json({ success: true, message: 'ลบเกมสำเร็จ' });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
