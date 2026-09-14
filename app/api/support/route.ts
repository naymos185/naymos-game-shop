import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.message ?? '').trim();
    const email = body.email ? String(body.email).trim() : null;

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: 'กรุณาใส่หัวข้อและข้อความ' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user?.id ?? null,
      email: email || user?.email || null,
      subject,
      message,
      status: 'open',
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
