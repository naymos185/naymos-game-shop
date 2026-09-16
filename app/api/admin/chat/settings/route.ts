import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ChatAiSettings } from '@/lib/chat/types';

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: settings } = await admin
      .from('chat_ai_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!settings) {
      // Default settings
      const defaultSettings: ChatAiSettings = {
        is_enabled: true,
        provider: 'auto',
        model_name: 'gemini-2.5-flash',
        welcome_message: 'สวัสดีครับพี่ ยินดีต้อนรับสู่ NayMos GameShop มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
        fallback_message: 'ขอโทษนะครับพี่ ตอนนี้ระบบผู้ช่วยอัตโนมัติมีปัญหานิดหน่อยครับ พี่สามารถส่งข้อความไว้ได้เลยครับ เดี๋ยวแอดมินเข้ามาช่วยดูให้ครับ',
      };
      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const admin = createAdminClient();

    const payload = {
      is_enabled: Boolean(body.is_enabled ?? true),
      provider: body.provider || 'auto',
      model_name: body.model_name || 'gemini-2.5-flash',
      system_prompt: body.system_prompt || '',
      welcome_message: body.welcome_message || 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ สอบถามได้เลยนะครับ ✨',
      fallback_message: body.fallback_message || 'ขอโทษนะครับพี่ ตอนนี้ระบบมีปัญหานิดหน่อยครับ พี่ส่งข้อความไว้ได้เลยครับ',
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await admin
      .from('chat_ai_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await admin
        .from('chat_ai_settings')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await admin
        .from('chat_ai_settings')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ settings: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
