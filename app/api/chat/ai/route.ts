import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { answerWithSharkAI } from '@/lib/chat/knowledge';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const query = typeof body.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return NextResponse.json({
        answer: 'พิมพ์คำถามมาได้เลยนะค้าบ น้องหลามพร้อมช่วยเหลือค้าบ 🦈✨',
      });
    }

    const admin = createAdminClient();
    const { data: knowledge } = await admin
      .from('chat_ai_knowledge')
      .select('*')
      .eq('is_active', true);

    const result = answerWithSharkAI(query, knowledge || []);

    return NextResponse.json({
      answer: result.answer,
      matchedTitle: result.matchedTitle ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
