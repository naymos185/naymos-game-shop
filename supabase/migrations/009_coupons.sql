CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'fixed'
    CHECK (discount_type IN ('fixed', 'percent')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
  END IF;
END $$;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read active coupons" ON public.coupons;
CREATE POLICY "Anyone read active coupons" ON public.coupons
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
    CREATE POLICY "Admins manage coupons" ON public.coupons
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;

INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, is_active)
VALUES
  ('NAYMOS10', 'ลด 10 บาท', 'fixed', 10, 0, 1000, true),
  ('SAVE20', 'ลด 20%', 'percent', 20, 50, 500, true)
ON CONFLICT (code) DO NOTHING;
