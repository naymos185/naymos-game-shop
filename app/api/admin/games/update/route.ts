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
    const gameId = String(body.id ?? '').trim();
    if (!gameId) {
      return NextResponse.json({ success: false, message: 'ไม่พบ ID ของเกม' }, { status: 400 });
    }

    const supabase = await createClient();

    // Build update payload – only include provided fields
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updatePayload.name = String(body.name);
    if (body.description !== undefined) updatePayload.description = body.description ? String(body.description) : null;
    if (body.category !== undefined) updatePayload.category = body.category ? String(body.category) : 'อื่นๆ';
    // Product Category (Generic) – do not touch legacy category
    if (body.product_category_id !== undefined) {
      updatePayload.product_category_id = body.product_category_id || null;
    }

    const { error: gameError } = await supabase
      .from('games')
      .update(updatePayload)
      .eq('id', gameId);

    if (gameError) {
      return NextResponse.json({ success: false, message: gameError.message }, { status: 400 });
    }

    // จัดการ game_fields
    if (body.game_fields && Array.isArray(body.game_fields)) {
      const fieldsData = body.game_fields;

      // ลบ fields ที่เป็น ID เก่า แต่ไม่อยู่ในลิสต์ใหม่
      const existingFieldIds = fieldsData
        .filter((f: any) => f.id && !f.id.startsWith('temp-') && !f.id.startsWith('preset-'))
        .map((f: any) => f.id);

      const { data: currentFields } = await supabase
        .from('game_fields')
        .select('id')
        .eq('game_id', gameId);

      const fieldsToDelete = (currentFields ?? [])
        .map((f) => f.id)
        .filter((id) => !existingFieldIds.includes(id));

      if (fieldsToDelete.length > 0) {
        await supabase.from('game_fields').delete().in('id', fieldsToDelete);
      }

      // เพิ่ม/อัปเดต fields ใหม่
      for (const f of fieldsData) {
        const fieldData = {
          game_id: gameId,
          key: String(f.key ?? '').toLowerCase().trim(),
          label: String(f.label ?? ''),
          type: String(f.type ?? 'text'),
          placeholder: f.placeholder ? String(f.placeholder) : null,
          required: f.required !== false,
          options: f.options ? JSON.stringify(f.options) : null,
          sort_order: Number(f.sort_order ?? 0),
          updated_at: new Date().toISOString(),
        };

        if (f.id && !f.id.startsWith('temp-') && !f.id.startsWith('preset-')) {
          await supabase.from('game_fields').update(fieldData).eq('id', f.id);
        } else {
          await supabase.from('game_fields').insert(fieldData);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'บันทึกเกมสำเร็จ' });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 },
    );
  }
}
