import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { listBannersAdmin } from '@/lib/banners/queries';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 });
  }
  const banners = await listBannersAdmin();
  return NextResponse.json({ success: true, banners });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const title = String(body.title ?? '').trim();
    if (!title) {
      return NextResponse.json({ success: false, message: 'ใส่หัวข้อแบนเนอร์' }, { status: 400 });
    }
    const supabase = await createClient();
    const { error } = await supabase.from('banners').insert({
      title,
      subtitle: body.subtitle ? String(body.subtitle) : null,
      link_url: body.link_url ? String(body.link_url) : '/games',
      button_text: body.button_text ? String(body.button_text) : 'ดูเพิ่ม',
      image_url: body.image_url ? String(body.image_url) : null,
      sort_order: Number(body.sort_order ?? 0) || 0,
      is_active: body.is_active !== false,
    });
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const id = String(body.id ?? '');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ไม่มี id' }, { status: 400 });
    }
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
    if (body.title !== undefined) updates.title = String(body.title).trim();

    const supabase = await createClient();
    const { error } = await supabase.from('banners').update(updates).eq('id', id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
