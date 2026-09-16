import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('chat_ai_knowledge')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { keywords, title, answer, priority, is_active } = body;

    if (!keywords || !title || !answer) {
      return NextResponse.json({ error: 'Keywords, title, and answer required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('chat_ai_knowledge')
      .insert({
        keywords,
        title,
        answer,
        priority: typeof priority === 'number' ? priority : 0,
        is_active: is_active !== false,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, keywords, title, answer, priority, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('chat_ai_knowledge')
      .update({
        keywords,
        title,
        answer,
        priority: typeof priority === 'number' ? priority : 0,
        is_active: Boolean(is_active),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('chat_ai_knowledge')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
