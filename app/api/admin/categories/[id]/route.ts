import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-user';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: 'ไม่มี id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.slug !== undefined) updates.slug = String(body.slug).trim();
    if (body.description !== undefined) updates.description = body.description ? String(body.description).trim() : null;
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order) || 0;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: 'ไม่มี id' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Check if category is used by any game
    const { count, error: countErr } = await supabase
      .from('games')
      .select('id', { count: 'exact', head: true })
      .eq('product_category_id', id);

    if (countErr) {
      return NextResponse.json({ success: false, message: countErr.message }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({
        success: false,
        message: `ไม่สามารถลบได้ เนื่องจากมีเกม/สินค้าใช้งานหมวดหมู่นี้อยู่ ${count} รายการ`,
      }, { status: 400 });
    }

    const { error: delErr } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (delErr) {
      return NextResponse.json({ success: false, message: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
