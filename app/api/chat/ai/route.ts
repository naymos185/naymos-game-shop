import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { askSmartSharkAi } from '@/lib/chat/ai-service';
import type { ChatAiKnowledge, ChatHistoryItem } from '@/lib/chat/types';

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
    const conversationHistory: ChatHistoryItem[] = Array.isArray(body.history) ? body.history : [];

    if (!query) {
      return NextResponse.json({
        answer: 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
        source: 'knowledge',
      });
    }

    const admin = createAdminClient();

    // 1. Fetch active knowledge
    const { data: knowledge } = await admin
      .from('chat_ai_knowledge')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // 2. Fetch live store games for context
    const { data: gamesData } = await admin
      .from('games')
      .select('name')
      .eq('is_active', true)
      .limit(20);

    const activeGameNames = gamesData?.map((g) => g.name) ?? [];

    const result = await askSmartSharkAi({
      query,
      knowledgeList: (knowledge as ChatAiKnowledge[]) || [],
      conversationHistory,
      liveStoreData: {
        games: activeGameNames,
        paymentMethods: ['PromptPay QR Code', 'NayMos Wallet'],
      },
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
