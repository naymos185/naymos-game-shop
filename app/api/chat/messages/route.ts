import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const admin = createAdminClient();

    let { data: conv } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!conv) {
      const { data: newConv, error: createErr } = await admin
        .from('chat_conversations')
        .insert({ user_id: user.id })
        .select('*')
        .single();
      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }
      conv = newConv;
    }

    if (conv.unread_user_count > 0) {
      await admin
        .from('chat_conversations')
        .update({ unread_user_count: 0 })
        .eq('id', conv.id);
      conv.unread_user_count = 0;
    }

    const { data: messages, error: msgErr } = await admin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({
      conversation: conv,
      messages: messages ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const text = typeof body.message === 'string' ? body.message.trim() : '';
    const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : null;

    if (!text && !imageUrl) {
      return NextResponse.json({ error: 'Message or image required' }, { status: 400 });
    }

    const admin = createAdminClient();

    let { data: conv } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!conv) {
      const { data: newConv, error: createErr } = await admin
        .from('chat_conversations')
        .insert({ user_id: user.id })
        .select('*')
        .single();
      if (createErr) throw createErr;
      conv = newConv;
    }

    const { data: newMsg, error: insertErr } = await admin
      .from('chat_messages')
      .insert({
        conversation_id: conv.id,
        sender_id: user.id,
        sender_role: 'user',
        message: text || null,
        image_url: imageUrl,
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    await admin
      .from('chat_conversations')
      .update({
        last_message_text: text || (imageUrl ? '[รูปภาพ]' : ''),
        last_message_at: new Date().toISOString(),
        unread_admin_count: (conv.unread_admin_count ?? 0) + 1,
        status: 'open',
      })
      .eq('id', conv.id);

    return NextResponse.json({ message: newMsg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
