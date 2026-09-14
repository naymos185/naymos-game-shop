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
    let slug = body.slug ? String(body.slug).trim() : slugify(name);
    slug = slugify(slug);
    const authType = body.auth_type === 'id_pass' ? 'id_pass' : 'uid';
    const fieldLabel = String(body.field_label ?? 'UID / OpenID').trim() || 'UID / OpenID';
    const imageUrl = body.icon ? String(body.icon).trim() : null;

    const supabase = await createClient();
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        name,
        slug,
        description: body.description ? String(body.description) : null,
        icon: imageUrl,
        banner: imageUrl,
        category: body.category ? String(body.category) : 'ทั้งหมด',
        is_active: body.is_active !== false,
        sort_order: Number(body.sort_order ?? 100) || 100,
      })
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, message: 'slug ซ้ำ — โปรดระบุชื่อหรือระบุ slug ใหม่' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    if (game?.id) {
      if (authType === 'id_pass') {
        await supabase.from('game_fields').insert([
          {
            game_id: game.id,
            name: 'username',
            label: 'Username / ID เกม',
            type: 'text',
            placeholder: 'กรอก Username หรือ ID เข้าเกม',
            required: true,
            sort_order: 1,
          },
          {
            game_id: game.id,
            name: 'password',
            label: 'Password (รหัสผ่าน)',
            type: 'text',
            placeholder: 'กรอกรหัสผ่านเพื่อเข้าเติม',
            required: true,
            sort_order: 2,
          }
        ]);
      } else {
        await supabase.from('game_fields').insert({
          game_id: game.id,
          name: 'uid',
          label: fieldLabel,
          type: 'text',
          placeholder: fieldLabel,
          required: true,
          sort_order: 1,
        });
      }
    }

    return NextResponse.json({ success: true, id: game?.id, slug });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
