-- 026_customer_support_chat_hardening.sql
-- Harden Customer Support Chat, Supabase Realtime, and Chat AI Settings

-- 1. Ensure foreign key between chat_conversations and public.profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_conversations_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.chat_conversations
      ADD CONSTRAINT chat_conversations_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Add chat tables to Supabase Realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_conversations'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
  END IF;
END $$;

-- 3. Chat AI Settings table
CREATE TABLE IF NOT EXISTS public.chat_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  provider TEXT NOT NULL DEFAULT 'auto',
  model_name TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  system_prompt TEXT,
  welcome_message TEXT NOT NULL DEFAULT 'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
  fallback_message TEXT NOT NULL DEFAULT 'ขอโทษนะครับพี่ ตอนนี้ระบบผู้ช่วยอัตโนมัติมีปัญหานิดหน่อยครับ พี่สามารถส่งข้อความไว้ได้เลยครับ เดี๋ยวแอดมินเข้ามาช่วยดูให้ครับ',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read chat ai settings" ON public.chat_ai_settings;
CREATE POLICY "Anyone can read chat ai settings" ON public.chat_ai_settings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins manage chat ai settings" ON public.chat_ai_settings;
CREATE POLICY "Admins manage chat ai settings" ON public.chat_ai_settings
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

GRANT SELECT ON public.chat_ai_settings TO authenticated;
GRANT ALL ON public.chat_ai_settings TO service_role;

-- Insert initial default settings row if not present
INSERT INTO public.chat_ai_settings (is_enabled, provider, model_name, welcome_message, fallback_message)
VALUES (
  true,
  'auto',
  'gemini-2.5-flash',
  'สวัสดีครับพี่ ยินดีช่วยเหลือครับ มีอะไรให้ผมช่วยดูแล สอบถามได้เลยนะครับ ✨',
  'ขอโทษนะครับพี่ ตอนนี้ระบบผู้ช่วยอัตโนมัติมีปัญหานิดหน่อยครับ พี่สามารถส่งข้อความไว้ได้เลยครับ เดี๋ยวแอดมินเข้ามาช่วยดูให้ครับ'
)
ON CONFLICT DO NOTHING;

-- 4. Update seeded knowledge answers with the polite personality
UPDATE public.chat_ai_knowledge
SET answer = 'วิธีการสั่งซื้อและเติมเกมกับ NayMos GameShop สะดวกและง่ายมากครับพี่ 🎮✨
1. เลือกเกมและแพ็กเกจที่ต้องการในหน้าเว็บ
2. กรอกข้อมูล UID หรือ ID เกมให้ถูกต้อง
3. ชำระเงินผ่าน PromptPay สแกน QR Code หรือชำระผ่าน Wallet ร้าน
4. แนบสลิปการโอนเงิน (หากจ่ายผ่าน QR Code)
5. รอระบบดำเนินการเติมให้ทันทีภายใน 3-10 นาทีครับ! พี่สามารถติดตามสถานะที่เมนู "ติดตามออเดอร์" ได้เลยครับ'
WHERE title = 'วิธีการเติมเกม';

UPDATE public.chat_ai_knowledge
SET answer = 'NayMos GameShop รองรับ 2 ช่องทางหลักครับพี่:
1. PromptPay QR Code: สแกนจ่ายผ่านแอปธนาคารทุกธนาคารได้ทันที ฟรีค่าธรรมเนียม
2. NayMos Wallet: กระเป๋าเงินเครดิตในเว็บ กดจ่ายได้ทันทีไม่ต้องรอตรวจสลิปครับ 💳⚡'
WHERE title = 'ช่องทางการชำระเงิน';

UPDATE public.chat_ai_knowledge
SET answer = 'พี่สามารถเช็คสถานะออเดอร์ได้ที่เมนู "ติดตามออเดอร์" ด้านบนของเว็บได้เลยครับ กรอกหมายเลขเลขออเดอร์หรืออีเมล หรือดูในประวัติการสั่งซื้อได้เลยครับ หากสถานะขึ้นเสร็จสิ้นแล้ว สามารถเข้าเกมตรวจสอบยอดได้ทันทีครับ ✨'
WHERE title = 'การติดตามออเดอร์';

UPDATE public.chat_ai_knowledge
SET answer = 'NayMos GameShop ให้บริการตลอดทุกวันครับพี่ 💖
หากต้องการคุยกับทีมงานแอดมิน สามารถสลับไปที่แท็บ "ติดต่อแอดมิน" ในหน้าต่างแชทนี้ได้เลยครับ หรือติดต่อทาง Facebook Fanpage: NayMosGameShop-บริการเติมเกมออนไลน์ ได้เลยครับผม!'
WHERE title = 'เวลาทำการและติดต่อแอดมิน';

UPDATE public.chat_ai_knowledge
SET answer = 'ทางร้านมีโปรโมชั่นสุดคุ้มและแจกแต้มพอยท์สะสมทุกออเดอร์ครับพี่ สามารถตรวจสอบโปรโมชั่นปัจจุบันได้ที่เมนู "โปรโมชั่น" บนแถบเมนูด้านบนได้เลยนะครับ 🎉'
WHERE title = 'โปรโมชั่นและส่วนลด';
