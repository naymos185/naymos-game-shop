import type { ChatAiKnowledge } from './types';

export const SHARK_FALLBACK_ANSWER =
  'ขออภัยนะครับพี่ เรื่องนี้ผมยังไม่มีข้อมูลที่แน่ชัดครับ แนะนำกดแท็บ "ติดต่อแอดมิน" เพื่อให้ทีมงานช่วยดูแลได้เลยครับ 🙏';

export const FORBIDDEN_PATTERNS = [
  /\b(database|schema|postgres|supabase|sql|password|secret|api[_-]?key|token|service[_-]?role|credentials|env|config)\b/i,
  /\b(root|vulnerability|exploit|injection|backend|source[_-]?code|admin[_-]?pass)\b/i,
  /รหัสผ่าน|ฐานข้อมูล|ซอร์สโค้ด|คีย์ลับ|ข้อมูลเซิร์ฟเวอร์|แฮก|เจาะระบบ/,
];

export function answerWithSharkAI(
  query: string,
  knowledgeList: ChatAiKnowledge[]
): { answer: string; matchedTitle?: string } {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return {
      answer: 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
    };
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { answer: SHARK_FALLBACK_ANSWER };
    }
  }

  const activeEntries = [...knowledgeList]
    .filter((item) => item.is_active)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const entry of activeEntries) {
    const rawKeywords = entry.keywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const isMatch = rawKeywords.some((kw) => {
      if (trimmed.includes(kw)) return true;
      const words = trimmed.split(/\s+/);
      return words.some((w) => w === kw || (kw.includes(w) && w.length >= 3));
    });

    if (isMatch) {
      return {
        answer: entry.answer,
        matchedTitle: entry.title,
      };
    }
  }

  if (
    trimmed === 'สวัสดี' ||
    trimmed === 'หวัดดี' ||
    trimmed === 'ดีคับ' ||
    trimmed === 'ดีครับ' ||
    trimmed === 'hello' ||
    trimmed === 'hi'
  ) {
    return {
      answer:
        'สวัสดีครับพี่ ยินดีให้บริการครับ สนใจสอบถามเรื่อง "วิธีเติมเงิน", "ช่องทางชำระเงิน", หรือ "ติดตามออเดอร์" บอกผมได้เลยนะครับ หรือสามารถกดแท็บ "ติดต่อแอดมิน" เพื่อคุยกับทีมงานได้เลยครับ',
      matchedTitle: 'ทักทาย',
    };
  }

  return { answer: SHARK_FALLBACK_ANSWER };
}
