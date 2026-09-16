import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    // Fetch conversations first without fragile PostgREST join
    const { data: conversations, error } = await admin
      .from('chat_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Fetch profile details for all conversation user_ids
    const userIds = Array.from(new Set(conversations.map((c) => c.user_id).filter(Boolean)));
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, phone')
      .in('id', userIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const enrichedConversations = conversations.map((c) => ({
      ...c,
      user: profileMap.get(c.user_id) || {
        id: c.user_id,
        email: null,
        full_name: 'ลูกค้า (ID: ' + c.user_id.slice(0, 8) + ')',
        role: 'customer',
        avatar_url: null,
      },
    }));

    return NextResponse.json({ conversations: enrichedConversations });
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

    // Attach profile info
    const { data: profile } = await admin
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, phone')
      .eq('id', userId)
      .maybeSingle();

    return NextResponse.json({
      conversation: {
        ...conv,
        user: profile || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
