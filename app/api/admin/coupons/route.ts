import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { listCouponsAdmin } from '@/lib/admin/coupons';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 });
  }
  const coupons = await listCouponsAdmin();
  return NextResponse.json({ success: true, coupons });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const code = String(body.code ?? '').trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ success: false, message: 'กรุณาใส่โค้ด' }, { status: 400 });
    }
    const discount_type = body.discount_type === 'percent' ? 'percent' : 'fixed';
    const discount_value = Number(body.discount_value);
    if (!discount_value || discount_value <= 0) {
      return NextResponse.json({ success: false, message: 'มูลค่าส่วนลดไม่ถูกต้อง' }, { status: 400 });
    }
    if (discount_type === 'percent' && discount_value > 100) {
      return NextResponse.json({ success: false, message: 'เปอร์เซ็นต์สูงสุด 100' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('coupons').insert({
      code,
      description: body.description ? String(body.description) : null,
      discount_type,
      discount_value,
      min_order_amount: Number(body.min_order_amount ?? 0) || 0,
      max_uses: body.max_uses != null && body.max_uses !== '' ? Number(body.max_uses) : null,
      is_active: body.is_active !== false,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, message: 'โค้ดนี้มีอยู่แล้ว' }, { status: 400 });
      }
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

    const supabase = await createClient();
    const { error } = await supabase.from('coupons').update(updates).eq('id', id);
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
