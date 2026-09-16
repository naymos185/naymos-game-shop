import type { ChatAiKnowledge, ChatHistoryItem } from './types';
import { SHARK_FALLBACK_ANSWER, FORBIDDEN_PATTERNS } from './knowledge';

export interface SharkAiOptions {
  query: string;
  knowledgeList: ChatAiKnowledge[];
  conversationHistory?: ChatHistoryItem[];
  fallbackMessage?: string;
  liveStoreData?: {
    games?: string[];
    paymentMethods?: string[];
    storeNotice?: string;
  };
}

export async function askSmartSharkAi({
  query,
  knowledgeList,
  conversationHistory = [],
  fallbackMessage,
  liveStoreData,
}: SharkAiOptions): Promise<{
  answer: string;
  source: 'knowledge' | 'gemini' | 'openai' | 'fallback';
  matchedTitle?: string;
}> {
  const trimmed = query.trim();

  // Guard: Empty query
  if (!trimmed) {
    return {
      answer: 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
      source: 'knowledge',
      matchedTitle: 'ทักทาย',
    };
  }

  // Guard: Security Forbidden Patterns
  const lower = trimmed.toLowerCase();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        answer: fallbackMessage?.trim() || SHARK_FALLBACK_ANSWER,
        source: 'fallback',
      };
    }
  }

  // Layer 1: Check Internal Custom Knowledge Base First (Priority Match)
  const activeEntries = [...knowledgeList]
    .filter((item) => item.is_active)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const entry of activeEntries) {
    const rawKeywords = entry.keywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const isMatch = rawKeywords.some((kw) => {
      if (lower.includes(kw)) return true;
      const words = lower.split(/\s+/);
      return words.some((w) => w === kw || (kw.includes(w) && w.length >= 3));
    });

    if (isMatch) {
      return {
        answer: entry.answer,
        source: 'knowledge',
        matchedTitle: entry.title,
      };
    }
  }

  // Layer 2: External AI (Google Gemini or OpenAI)
  const rawGeminiKey = process.env.GEMINI_API_KEY;
  const rawOpenaiKey = process.env.OPENAI_API_KEY;

  const geminiApiKey = rawGeminiKey ? rawGeminiKey.trim().replace(/^["']|["']$/g, '') : '';
  const openaiApiKey = rawOpenaiKey ? rawOpenaiKey.trim().replace(/^["']|["']$/g, '') : '';

  if (geminiApiKey || openaiApiKey) {
    try {
      const knowledgeContext = activeEntries
        .slice(0, 15)
        .map((k) => `- [${k.title}]: ${k.answer}`)
        .join('\n');

      const gamesList = liveStoreData?.games?.length
        ? liveStoreData.games.join(', ')
        : 'Valorant, ROV, PUBG Mobile, Free Fire, Genshin Impact, Honkai Star Rail, Roblox, League of Legends, และเกมชั้นนำอื่นๆ';

      const systemPrompt = `คุณคือผู้ช่วยแชทอัจฉริยะประจำร้าน "NayMos GameShop" (บริการเติมเกมออนไลน์ ซื้อขายไอดีเกม และบริการเกม)

บุคลิกและมารยาทในการตอบ (ต้องปฏิบัติตามอย่างเคร่งครัด):
1. สุภาพ อ่อนโยน น่ารัก เป็นมิตร ใจเย็น และช่วยเหลือดี ไม่แข็งกระด้าง
2. สรรพนาม: เรียกลูกค้าว่า "พี่" เสมอ
3. คำลงท้าย: ลงท้ายด้วย "ครับ" เสมอ
4. ข้อห้ามเด็ดขาดด้านคำพูด:
   - ห้ามใช้: "งับ", "ค้าบ", "ค้าบบ", "คุณลูกค้า", "ผู้ใช้", "user"
   - ไม่ต้องแทนตัวเองว่า "น้องหลาม" และไม่ต้องแนะนำตัวเองซ้ำทุกครั้ง
   - ห้ามพูดแบบหุ่นยนต์หรือระบบอัตโนมัติ เช่น "คำขอของคุณได้รับการประมวลผล", "จากข้อมูลที่มีอยู่ในระบบ", "ในฐานะ AI", "ฉันไม่สามารถ...", "ระบบของเรา..."
   - ให้พูดเหมือนพนักงานร้านที่คุยกับลูกค้าอย่างเป็นกันเองและจริงใจ
5. ความกระชับ: ตอบตรงประเด็น ไม่เยิ่นเย้อ ไม่ยาวเกินความจำเป็น
6. ข้อมูลสำคัญห้ามแต่งเองเด็ดขาด:
   - ห้ามเดาราคา ห้ามแต่งโปรโมชั่นเอง
   - ห้ามบอกว่าเติมเงินสำเร็จถ้าระบบยังไม่ยืนยัน
   - หากลูกค้าถามเรื่องเงินยังไม่เข้าหรือสถานะออเดอร์ ให้ตอบด้วยความสุภาพ เช่น "ขอโทษที่ให้พี่รอนะครับ เดี๋ยวผมช่วยเช็กให้ครับ พี่ส่งเลขออเดอร์มาให้หน่อยได้ไหมครับ"
   - ถ้าเป็นเรื่องที่ไม่มีข้อมูลชัดเจน ให้ตอบตรงๆ เช่น "เรื่องนี้ผมยังไม่มีข้อมูลที่ยืนยันได้ครับพี่ เดี๋ยวให้แอดมินช่วยเช็กให้ดีกว่าครับ" หรือแนะนำให้สลับแท็บ "ติดต่อแอดมิน"

ข้อมูลร้านและระบบของ NayMos GameShop:
- รายการเกมที่มีให้บริการ: ${gamesList}
- ช่องทางชำระเงิน: PromptPay QR Code (สแกนจ่ายผ่านแอปธนาคาร ฟรีค่าธรรมเนียม) และ NayMos Wallet
- การเติมเงิน: ดำเนินการรวดเร็ว 3-10 นาที
- หน้าติดตามออเดอร์: ตรวจสอบสถานะได้จากเมนู "ติดตามออเดอร์" บนแถบเมนู
- ข้อมูลที่ใช้เติมแต่ละเกม:
  * Valorant: ใช้ Riot ID กับ Tagline
  * PUBG Mobile: ใช้ UID
  * ROV / Free Fire / OpenID: ใช้ UID / OpenID ตามที่ระบบระบุ
- คำตอบและข้อมูลเฉพาะของร้าน:
${knowledgeContext}

ให้ตอบคำถามของลูกค้าโดยอ้างอิงข้อมูลข้างต้นและบทสนทนาก่อนหน้าอย่างแม่นยำและเป็นธรรมชาติ`;

      // Build history messages
      const formattedHistory = conversationHistory.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      // Try Google Gemini
      if (geminiApiKey) {
        const geminiModels = [
          'gemini-2.5-flash',
          'gemini-1.5-flash',
          'gemini-2.0-flash',
          'gemini-2.5-flash-lite',
        ];

        for (const model of geminiModels) {
          try {
            const contents = [
              ...formattedHistory,
              { role: 'user', parts: [{ text: trimmed }] },
            ];

            // Thinking models (2.5) consume output tokens for reasoning by default.
            // Disable thinking and raise the token budget so answers are never empty.
            const generationConfig: Record<string, unknown> = {
              temperature: 0.65,
              maxOutputTokens: 2048,
            };
            if (model.startsWith('gemini-2.5')) {
              generationConfig.thinkingConfig = { thinkingBudget: 0 };
            }

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: systemPrompt }],
                  },
                  contents,
                  generationConfig,
                }),
              }
            );

            if (!response.ok) {
              const errText = await response.text();
              console.warn(
                `Gemini model ${model} failed with HTTP ${response.status}:`,
                errText.slice(0, 300)
              );
              continue;
            }

            const resData = await response.json();
            const candidate = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate && candidate.trim()) {
              return {
                answer: candidate.trim(),
                source: 'gemini',
              };
            }
            console.warn(`Gemini model ${model} returned empty candidate`);
          } catch (modelErr) {
            console.warn(`Gemini model ${model} failed, trying next:`, modelErr);
          }
        }
      }

      // Try OpenAI fallback
      if (openaiApiKey) {
        const openaiHistory = conversationHistory.slice(-6).map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...openaiHistory,
              { role: 'user', content: trimmed },
            ],
            temperature: 0.65,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`OpenAI failed with HTTP ${response.status}:`, errText.slice(0, 300));
        } else {
          const resData = await response.json();
          const choice = resData?.choices?.[0]?.message?.content;
          if (choice && choice.trim()) {
            return {
              answer: choice.trim(),
              source: 'openai',
            };
          }
        }
      }
    } catch (aiErr) {
      console.error('External AI call error:', aiErr);
    }
  }

  // Graceful Fallback (uses admin-configurable message when available)
  return {
    answer: fallbackMessage?.trim() || SHARK_FALLBACK_ANSWER,
    source: 'fallback',
  };
}
