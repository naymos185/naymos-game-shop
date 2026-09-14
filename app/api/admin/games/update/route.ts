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
    const id = String(body.id ?? '');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ไม่มี id เกม' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined) updates.description = String(body.description);
    if (body.icon !== undefined) updates.icon = String(body.icon).trim();
    if (body.banner !== undefined) updates.banner = String(body.banner).trim();
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order) || 0;

    const supabase = await createClient();
    const { error } = await supabase.from('games').update(updates).eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลเกมสำเร็จ' });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
