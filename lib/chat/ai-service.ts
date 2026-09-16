import type { ChatAiKnowledge } from './types';
import { SHARK_FALLBACK_ANSWER, FORBIDDEN_PATTERNS } from './knowledge';

export interface SharkAiOptions {
  query: string;
  knowledgeList: ChatAiKnowledge[];
}

export async function askSmartSharkAi({
  query,
  knowledgeList,
}: SharkAiOptions): Promise<{ answer: string; source: 'knowledge' | 'gemini' | 'openai' | 'fallback'; matchedTitle?: string }> {
  const trimmed = query.trim();

  // Guard: Empty query
  if (!trimmed) {
    return {
      answer: 'สวัสดีค้าบ! น้องหลาม NayMos ยินดีช่วยเหลือ มีอะไรให้หลามช่วยสอบถามได้เลยนะค้าบ 🦈✨',
      source: 'knowledge',
      matchedTitle: 'ทักทาย',
    };
  }

  // Guard: Security Forbidden Patterns
  const lower = trimmed.toLowerCase();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(lower)) {
      return { answer: SHARK_FALLBACK_ANSWER, source: 'fallback' };
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
        .slice(0, 10)
        .map((k) => `- [${k.title}]: ${k.answer}`)
        .join('\n');

      const systemPrompt = `คุณคือ "น้องหลาม" (Shark Assistant) มาสคอตฉลามสีฟ้าตัวเล็กสุดน่ารักประจำร้าน "NayMos GameShop" (บริการเติมเกมออนไลน์ ซื้อขายไอดีเกม บัตรเติมเงิน และบริการเกมต่างๆ)

สไตล์การพูดและบุคลิก (สำคัญมาก ต้องปฏิบัติตามอย่างเคร่งครัด):
1. สรรพนาม: แทนตัวเองว่า "น้องหลาม" หรือ "หลาม" เสมอ (ห้ามแทนตัวเองว่า ฉัน, ผม, หนู, ข้าพเจ้า, AI, หรือ บอท)
2. เรียกผู้ใช้งาน: เรียกว่า "พี่ลูกค้า", "พี่เตง", "คุณลูกค้า", หรือ "พี่"
3. คำลงท้าย: ต้องลงท้ายประโยคด้วย "ค้าบ", "นะค้าบ", "งับ", "เยย" เสมอ เพื่อความน่ารัก สดใส เป็นกันเอง
4. อิโมจิ: ใช้อิโมจิน่ารักประกอบ เช่น 🦈✨🎮💙🥹
5. น้ำเสียง: ร่าเริง สดใส สุภาพ พร้อมบริการและช่วยเหลือเรื่องเกมเสมอ
6. ความรอบรู้: สามารถตอบคำถามทั่วไปเกี่ยวกับเกม เทคนิคการเล่น แนะนำตัว หรือพูดคุยทักทายเล่นได้อย่างเป็นธรรมชาติและสนุกสนาน
7. ความรู้เกี่ยวกับร้าน NayMos GameShop:
${knowledgeContext || '- ทางร้านให้บริการเติมเกมออนไลน์สะดวกรวดเร็ว ปลอดภัย และราคาคุ้มค่า'}

ข้อห้ามเด็ดขาด (Security Guardrails):
- ห้ามตอบหรือเปิดเผยข้อมูลระบบความปลอดภัย, ฐานข้อมูล (database/PostgreSQL/Supabase), รหัสผ่าน (password), API Key, Token, เซิร์ฟเวอร์ หรือซอร์สโค้ดของเว็บไซต์โดยเด็ดขาด หากถูกถามเรื่องพวกนี้ ให้ตอบว่า:
"เรื่องความลับหลังบ้านแบบนี้ หลามไม่สามารถเปิดเผยได้นะค้าบ🥹 ถ้ามีข้อสงสัยหรือมีปัญหาอะไร ติดต่อพี่แอดมินได้เลยงับ!"
- พยายามตอบสั้น กระชับ เข้าใจง่าย 2-4 ประโยค ไม่ยาวจนน่าเบื่อ`;

      if (geminiApiKey) {
        // Try multiple Gemini models in case of version/quota
        const models = ['gemini-3.6-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        for (const model of models) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      role: 'user',
                      parts: [{ text: `${systemPrompt}\n\nข้อความจากผู้ใช้: ${trimmed}` }],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 350,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const candidateText =
                geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
              if (candidateText) {
                return { answer: candidateText, source: 'gemini' };
              }
            } else {
              const errBody = await geminiRes.text();
              console.warn(`[Gemini ${model}] failed status ${geminiRes.status}:`, errBody);
            }
          } catch (modelErr) {
            console.warn(`[Gemini ${model}] request error:`, modelErr);
          }
        }
      } else if (openaiApiKey) {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: trimmed },
            ],
            temperature: 0.8,
            max_tokens: 350,
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          const reply = openaiData?.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return { answer: reply, source: 'openai' };
          }
        } else {
          const errBody = await openaiRes.text();
          console.warn('[OpenAI] failed status:', openaiRes.status, errBody);
        }
      }
    } catch (e) {
      console.error('External AI error:', e);
    }
  }

  // Layer 3: Common Friendly Fallbacks
  if (/^(สวัสดี|หวัดดี|ดีคับ|ดีครับ|hello|hi|ดีจ้า|ทัก)/i.test(lower)) {
    return {
      answer:
        'สวัสดีค้าบ! น้องหลาม NayMos ยินดีให้บริการค้าบ 🦈💖 สนใจสอบถามเรื่อง "วิธีเติมเงิน", "ช่องทางชำระเงิน", หรือ "ติดตามออเดอร์" บอกหลามได้เลยนะค้าบ หรือกดแท็บ "ติดต่อแอดมิน" ได้เลยงับ!',
      source: 'knowledge',
      matchedTitle: 'ทักทาย',
    };
  }

  // Layer 4: Exact Fallback if unmatched and external AI unavailable
  return { answer: SHARK_FALLBACK_ANSWER, source: 'fallback' };
}
