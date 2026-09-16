import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Reset unread_admin_count
    await admin
      .from('chat_conversations')
      .update({ unread_admin_count: 0 })
      .eq('id', conversationId);

    const { data: messages, error } = await admin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const conversationId = body.conversationId;
    const text = typeof body.message === 'string' ? body.message.trim() : '';
    const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : null;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    if (!text && !imageUrl) {
      return NextResponse.json({ error: 'Message or image required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: conv } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const { data: newMsg, error: insertErr } = await admin
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: adminUser.id,
        sender_role: 'admin',
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
        unread_user_count: (conv.unread_user_count ?? 0) + 1,
      })
      .eq('id', conversationId);

    return NextResponse.json({ message: newMsg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
