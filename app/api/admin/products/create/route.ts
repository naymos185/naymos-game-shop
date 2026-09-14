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
    const game_id = String(body.game_id ?? '').trim();
    const name = String(body.name ?? '').trim();
    const price = Number(body.price);
    const cost = Number(body.cost ?? 0);

    if (!game_id || !name) {
      return NextResponse.json({ success: false, message: 'เลือกเกมและใส่ชื่อแพ็ก' }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ success: false, message: 'ราคาไม่ถูกต้อง' }, { status: 400 });
    }
    if (Number.isNaN(cost) || cost < 0) {
      return NextResponse.json({ success: false, message: 'ต้นทุนไม่ถูกต้อง' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: game } = await supabase
      .from('games')
      .select('id')
      .eq('id', game_id)
      .maybeSingle();
    if (!game) {
      return NextResponse.json({ success: false, message: 'ไม่พบเกม' }, { status: 400 });
    }

    const { error } = await supabase.from('products').insert({
      game_id,
      name,
      price,
      cost,
      amount: body.amount != null && body.amount !== '' ? Number(body.amount) : null,
      currency: 'THB',
      is_active: body.is_active !== false,
      sort_order: Number(body.sort_order ?? 0) || 0,
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
