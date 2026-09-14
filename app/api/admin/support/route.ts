import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { listTicketsAdmin } from '@/lib/support/queries';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 });
  }
  const tickets = await listTicketsAdmin();
  return NextResponse.json({ success: true, tickets });
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
    if (body.status) updates.status = String(body.status);
    if (body.admin_note !== undefined) updates.admin_note = String(body.admin_note);

    const supabase = await createClient();
    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id);
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
