-- 025_customer_support_chat.sql
-- Customer live chat + AI assistant knowledge base

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  unread_user_count INT NOT NULL DEFAULT 0,
  unread_admin_count INT NOT NULL DEFAULT 0,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_msg ON public.chat_conversations(last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin', 'ai')),
  message TEXT,
  image_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.chat_ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords TEXT NOT NULL, -- comma separated keywords
  title TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_ai_knowledge_priority ON public.chat_ai_knowledge(priority DESC, created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_ai_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS chat_conversations
DROP POLICY IF EXISTS "Users can view own conversation" ON public.chat_conversations;
CREATE POLICY "Users can view own conversation" ON public.chat_conversations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Users can update own conversation" ON public.chat_conversations;
CREATE POLICY "Users can update own conversation" ON public.chat_conversations
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Users can insert own conversation" ON public.chat_conversations;
CREATE POLICY "Users can insert own conversation" ON public.chat_conversations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- RLS chat_messages
DROP POLICY IF EXISTS "Users can view messages in own conversation" ON public.chat_messages;
CREATE POLICY "Users can view messages in own conversation" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND (c.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
    )
  );

DROP POLICY IF EXISTS "Users can insert message in own conversation" ON public.chat_messages;
CREATE POLICY "Users can insert message in own conversation" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND (c.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
    )
  );

-- RLS chat_ai_knowledge
DROP POLICY IF EXISTS "Anyone can read active ai knowledge" ON public.chat_ai_knowledge;
CREATE POLICY "Anyone can read active ai knowledge" ON public.chat_ai_knowledge
  FOR SELECT TO authenticated
  USING (is_active = true OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins manage ai knowledge" ON public.chat_ai_knowledge;
CREATE POLICY "Admins manage ai knowledge" ON public.chat_ai_knowledge
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.chat_conversations TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT SELECT ON public.chat_ai_knowledge TO authenticated;
GRANT ALL ON public.chat_ai_knowledge TO service_role;
GRANT ALL ON public.chat_conversations TO service_role;
GRANT ALL ON public.chat_messages TO service_role;

-- Storage bucket for chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Seed default AI knowledge
INSERT INTO public.chat_ai_knowledge (keywords, title, answer, is_active, priority)
VALUES
  ('เติมเงิน,วิธีเติม,เติมยังไง,สั่งซื้อ,ซื้อยังไง,สั่งยังไง', 'วิธีการเติมเกม', 'วิธีการสั่งซื้อและเติมเกมกับ NayMos GameShop สะดวกและง่ายมากๆ ค้าบ 🎮✨
1. เลือกเกมและแพ็กเกจที่ต้องการในหน้าเว็บ
2. กรอกข้อมูล UID หรือ ID เกมให้ถูกต้อง
3. ชำระเงินผ่าน PromptPay สแกน QR Code หรือชำระผ่าน Wallet ร้าน
4. แนบสลิปการโอนเงิน (หากจ่ายผ่าน QR Code)
5. รอระบบดำเนินการเติมให้ทันทีภายใน 3-10 นาทีค้าบ! ติดตามสถานะที่เมนู "ติดตามออเดอร์" ได้เลยค้าบ', true, 10),
  ('จ่ายเงิน,ช่องทางชำระ,promptpay,พร้อมเพย์,wallet,วอเลท,ธนาคาร,โอนเงิน', 'ช่องทางการชำระเงิน', 'NayMos GameShop รองรับ 2 ช่องทางหลักค้าบ:
1. PromptPay QR Code: สแกนจ่ายผ่านแอปธนาคารทุกธนาคารได้ทันที ฟรีค่าธรรมเนียม
2. NayMos Wallet: กระเป๋าเงินเครดิตในเว็บ กดจ่ายได้ทันทีไม่ต้องรอตรวจสลิปค้าบ 💳⚡', true, 9),
  ('ติดตาม,ออเดอร์,เช็คสถานะ,ได้ยัง,เมื่อไหร่,สถานะ', 'การติดตามออเดอร์', 'สามารถเช็คสถานะออเดอร์ได้ที่เมนู "ติดตามออเดอร์" ด้านบนของเว็บได้เลยค้าบ กรอกหมายเลขเลขออเดอร์หรืออีเมล หรือดูในประวัติการสั่งซื้อได้เลยค้าบ หากสถานะขึ้นเสร็จสิ้นแล้ว สามารถเข้าเกมตรวจสอบยอดได้ทันทีค้าบ ✨', true, 8),
  ('เวลาทำการ,เปิดกี่โมง,ปิดกี่โมง,ติดต่อ,แอดมิน,ติดต่อแอดมิน', 'เวลาทำการและติดต่อแอดมิน', 'NayMos GameShop ให้บริการตลอดทุกวันค้าบ 🦈💖
หากต้องการคุยกับพี่แอดมินคนจริง สามารถสลับไปที่แท็บ "ติดต่อแอดมิน" ในหน้าต่างแชทนี้ได้เลยค้าบ หรือติดต่อทาง Facebook Fanpage: NayMosGameShop-บริการเติมเกมออนไลน์ ค้าบผม!', true, 7),
  ('โปรโมชั่น,ลดราคา,คูปอง,ส่วนลด,โค้ด', 'โปรโมชั่นและส่วนลด', 'ทางร้านมีโปรโมชั่นสุดคุ้มและแจกแต้มพอยท์สะสมทุกออเดอร์ค้าบ สามารถตรวจสอบโปรโมชั่นปัจจุบันได้ที่เมนู "โปรโมชั่น" บนแถบเมนูด้านบนได้เลยนะค้าบ 🎉', true, 6)
ON CONFLICT DO NOTHING;
