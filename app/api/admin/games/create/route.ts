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
      return NextResponse.json({ success: false, message: 'ใส่ชื่อเกม' }, { status: 400 });
    }
    let slug = body.slug ? String(body.slug).trim() : slugify(name);
    slug = slugify(slug);

    const supabase = await createClient();
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        name,
        slug,
        description: body.description ? String(body.description) : null,
        category: body.category ? String(body.category) : 'อื่นๆ',
        is_active: body.is_active !== false,
        sort_order: Number(body.sort_order ?? 100) || 100,
      })
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, message: 'slug ซ้ำ — เปลี่ยนชื่อหรือ slug' }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    if (game?.id && body.game_fields && Array.isArray(body.game_fields)) {
      const fieldsToInsert = body.game_fields.map((f: any) => ({
        game_id: game.id,
        key: String(f.key ?? '').toLowerCase().trim(),
        label: String(f.label ?? ''),
        type: String(f.type ?? 'text'),
        placeholder: f.placeholder ? String(f.placeholder) : null,
        required: f.required !== false,
        options: f.options ? JSON.stringify(f.options) : null,
        sort_order: Number(f.sort_order ?? 0),
      }));

      const { error: fieldsError } = await supabase
        .from('game_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error('เพิ่ม fields ผิดพลาด:', fieldsError);
        return NextResponse.json({ success: false, message: 'เพิ่ม fields ผิดพลาด' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, id: game?.id, slug });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
