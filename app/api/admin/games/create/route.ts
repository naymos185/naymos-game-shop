import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-user';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `game-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อเกม' }, { status: 400 });
    }
    let slug = body.slug ? slugify(String(body.slug)) : slugify(name);
    const category = body.category ? String(body.category).trim() : 'ทั้งหมด';
    const description = body.description ? String(body.description).trim() : null;
    const icon = body.icon ? String(body.icon).trim() : null;
    const banner = body.banner ? String(body.banner).trim() : null;
    const is_active = body.is_active !== undefined ? Boolean(body.is_active) : true;
    const sort_order = Number.isInteger(body.sort_order) ? Number(body.sort_order) : 0;
    const product_category_id = body.product_category_id || null;

    const supabase = await createClient();

    // Check slug duplicate
    const { data: existing } = await supabase.from('games').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        slug,
        name,
        category,
        description,
        icon,
        banner,
        is_active,
        sort_order,
        product_category_id,
      })
      .select()
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { success: false, message: gameError?.message || 'ไม่สามารถสร้างเกมได้' },
        { status: 500 }
      );
    }

    // Default field based on authType
    const authType = body.authType === 'id_pass' ? 'id_pass' : 'uid';
    const fieldLabel = String(body.fieldLabel ?? '').trim() || (authType === 'uid' ? 'UID / OpenID' : 'ID เกม');

    if (authType === 'uid') {
      await supabase.from('game_fields').insert({
        game_id: game.id,
        name: 'uid',
        label: fieldLabel,
        type: 'text',
        placeholder: 'กรอก UID',
        required: true,
        sort_order: 1,
      });
    } else {
      await supabase.from('game_fields').insert([
        {
          game_id: game.id,
          name: 'username',
          label: fieldLabel,
          type: 'text',
          placeholder: 'กรอก Username / ID',
          required: true,
          sort_order: 1,
        },
        {
          game_id: game.id,
          name: 'password',
          label: 'รหัสผ่าน',
          type: 'password',
          placeholder: 'กรอกรหัสผ่าน',
          required: true,
          sort_order: 2,
        },
      ]);
    }

    return NextResponse.json({ success: true, game });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
