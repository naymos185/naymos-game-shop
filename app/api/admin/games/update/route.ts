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
    if (body.slug !== undefined) updates.slug = String(body.slug).trim();
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.product_category_id !== undefined) updates.product_category_id = body.product_category_id || null;
    if (body.description !== undefined) updates.description = body.description ? String(body.description).trim() : null;
    if (body.icon !== undefined) updates.icon = body.icon ? String(body.icon).trim() : null;
    if (body.banner !== undefined) updates.banner = body.banner ? String(body.banner).trim() : null;
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order) || 0;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, game: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
