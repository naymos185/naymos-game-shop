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
      return NextResponse.json({ success: false, message: 'ไม่มี id แพ็กเกจ' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (Number.isNaN(price) || price < 0) {
        return NextResponse.json({ success: false, message: 'ราคาไม่ถูกต้อง' }, { status: 400 });
      }
      updates.price = price;
    }
    if (body.reseller_price !== undefined) {
      updates.reseller_price = body.reseller_price === null || body.reseller_price === '' ? null : Number(body.reseller_price);
    }
    if (body.cost !== undefined) {
      const cost = Number(body.cost);
      if (Number.isNaN(cost) || cost < 0) {
        return NextResponse.json({ success: false, message: 'ต้นทุนไม่ถูกต้อง' }, { status: 400 });
      }
      updates.cost = cost;
    }
    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
    }
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ success: false, message: 'ชื่อว่างไม่ได้' }, { status: 400 });
      }
      updates.name = name;
    }

    const supabase = await createClient();
    const { error } = await supabase.from('products').update(updates).eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
