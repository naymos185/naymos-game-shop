import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: conversations, error } = await admin
      .from('chat_conversations')
      .select(`
        *,
        user:profiles(id, email, full_name, role, avatar_url)
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    let { data: conv } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!conv) {
      const { data: newConv, error: createErr } = await admin
        .from('chat_conversations')
        .insert({ user_id: userId })
        .select('*')
        .single();
      if (createErr) throw createErr;
      conv = newConv;
    }

    return NextResponse.json({ conversation: conv });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
