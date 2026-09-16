import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401 as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403 as const };
  }
  return { supabase, user };
}

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('product_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const name = String(body.name ?? '').trim();
  if (!name) {
    return NextResponse.json({ success: false, message: 'ต้องระบุชื่อหมวดหมู่' }, { status: 400 });
  }

  const slug =
    String(body.slug ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/gi, '-')
      .replace(/^-|-$/g, '');

  const { data, error } = await auth.supabase
    .from('product_categories')
    .insert({
      name,
      slug,
      description: body.description ?? null,
      is_active: body.is_active !== false,
      sort_order: Number(body.sort_order) || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const id = body.id;
  if (!id) {
    return NextResponse.json({ success: false, message: 'ต้องระบุ id' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);
  if (body.slug !== undefined) updates.slug = String(body.slug).trim();

  const { data, error } = await auth.supabase
    .from('product_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'ต้องระบุ id' }, { status: 400 });
  }

  // Prevent delete if still used by any game
  const { count } = await auth.supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('product_category_id', id);

  if (count && count > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `ไม่สามารถลบได้ เพราะมีเกม ${count} รายการใช้หมวดนี้อยู่ กรุณาเปลี่ยนหมวดของเกมก่อน`,
      },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase.from('product_categories').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
