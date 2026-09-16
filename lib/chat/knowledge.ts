import type { ChatAiKnowledge } from './types';

export const SHARK_FALLBACK_ANSWER =
  'หลามก็ไม่ทราบเหมือนกันค้าบ🥹 แต่สามารถติดต่อ admin ได้เลยนะค้าบบบบ';

const FORBIDDEN_PATTERNS = [
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
      answer: 'สวัสดีค้าบ! น้องหลาม NayMos ยินดีช่วยเหลือ มีอะไรให้หลามช่วยสอบถามได้เลยนะค้าบ 🦈✨',
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
        'สวัสดีค้าบ! น้องหลาม NayMos ยินดีให้บริการค้าบ 🦈💖 สนใจสอบถามเรื่อง "วิธีเติมเงิน", "ช่องทางชำระเงิน", หรือ "ติดตามออเดอร์" บอกหลามได้เลยนะค้าบ หรือกดแท็บ "ติดต่อแอดมิน" ได้เลยค้าบ!',
      matchedTitle: 'ทักทาย',
    };
  }

  return { answer: SHARK_FALLBACK_ANSWER };
}
