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
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (geminiApiKey || openaiApiKey) {
    try {
      // Build context from active knowledge base
      const knowledgeContext = activeEntries
        .slice(0, 8)
        .map((k) => `- หัวข้อ "${k.title}": ${k.answer}`)
        .join('\n');

      const systemPrompt = `คุณคือ "น้องหลาม" (Shark Assistant) มาสคอตฉลามสีฟ้าน่ารักประจำเว็บไซต์ NayMos GameShop (ร้านบริการเติมเกมออนไลน์ ซื้อขายไอดีเกม และบริการเกมต่างๆ)
บุคลิกของคุณ: ร่าเริง น่ารัก สุภาพ เป็นมิตร ขี้เล่น ใช้น้ำเสียงเด็กหนุ่มน่ารัก ใช้คำลงท้ายว่า "ค้าบ", "นะค้าบ", "งับ" ใช้อิโมจิน่ารัก เช่น 🦈✨🎮💖
หน้าที่: ตอบคำถาม แนะนำเกม วิธีการเล่น และพูดคุยให้ความช่วยเหลือลูกค้า

ข้อมูลบริการของร้าน NayMos GameShop ที่คุณรู้:
${knowledgeContext || '- ร้านให้บริการเติมเกมออนไลน์รวดเร็ว ปลอดภัย และมีระบบสะสมแต้ม/สิทธิพิเศษ'}

กฎเหล็กสำคัญที่สุด:
1. ห้ามตอบหรือเปิดเผยข้อมูลความปลอดภัย ข้อมูลเชิงลึกทางเทคนิค โครงสร้างฐานข้อมูล รหัสผ่าน เซิร์ฟเวอร์ API keys หรือซอร์สโค้ดโดยเด็ดขาด
2. หากเป็นเรื่องที่คุณไม่รู้ ไม่แน่ใจ หรือไม่มีข้อมูลในร้าน ให้ตอบว่า:
"หลามก็ไม่ทราบเหมือนกันค้าบ🥹 แต่สามารถติดต่อ admin ได้เลยนะค้าบบบบ"
3. ตอบกระชับ น่ารัก อ่านง่าย ไม่ยาวเกินไป (ไม่เกิน 2-4 ประโยคต่อคำตอบ)`;

      if (geminiApiKey) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nคำถามจากผู้ใช้: ${trimmed}` }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
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
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          const reply = openaiData?.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return { answer: reply, source: 'openai' };
          }
        }
      }
    } catch (e) {
      console.error('External AI error:', e);
    }
  }

  // Layer 3: Common Friendly Fallbacks
  if (/^(สวัสดี|หวัดดี|ดีคับ|ดีครับ|hello|hi|ดีจ้า)/i.test(lower)) {
    return {
      answer:
        'สวัสดีค้าบ! น้องหลาม NayMos ยินดีให้บริการค้าบ 🦈💖 สนใจสอบถามเรื่อง "วิธีเติมเงิน", "ช่องทางชำระเงิน", หรือ "ติดตามออเดอร์" บอกหลามได้เลยนะค้าบ หรือกดแท็บ "ติดต่อแอดมิน" ได้เลยค้าบ!',
      source: 'knowledge',
      matchedTitle: 'ทักทาย',
    };
  }

  // Layer 4: Exact Fallback if unmatched and no external AI
  return { answer: SHARK_FALLBACK_ANSWER, source: 'fallback' };
}
