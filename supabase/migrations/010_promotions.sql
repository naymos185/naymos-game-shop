CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  image_url TEXT,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active, sort_order);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read active promotions" ON public.promotions;
CREATE POLICY "Anyone read active promotions" ON public.promotions
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage promotions" ON public.promotions;
    CREATE POLICY "Admins manage promotions" ON public.promotions
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promotions TO authenticated;

INSERT INTO public.promotions (title, description, badge, link_url, sort_order, is_active)
VALUES
  ('เปิดร้านใหม่ ลดพิเศษ', 'ใช้โค้ด NAYMOS10 ลดทันที 10 บาททุกออเดอร์', 'ใหม่', '/games', 1, true),
  ('เติมเยอะ คุ้มกว่า', 'แพ็กใหญ่ Free Fire / RoV ราคาพิเศษ', 'ฮอต', '/games', 2, true);
