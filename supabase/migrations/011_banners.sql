CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, sort_order);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read active banners" ON public.banners;
CREATE POLICY "Anyone read active banners" ON public.banners
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage banners" ON public.banners;
    CREATE POLICY "Admins manage banners" ON public.banners
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;

INSERT INTO public.banners (title, subtitle, link_url, button_text, sort_order, is_active)
VALUES
  ('เติมเกมราคาพิเศษ', 'ใช้โค้ด NAYMOS10 ลดทันที', '/games', 'เติมเลย', 1, true),
  ('บริการ 24 ชม.', 'ระบบอัตโนมัติ ปลอดภัย มั่นใจ', '/how-to', 'วิธีเติม', 2, true);
