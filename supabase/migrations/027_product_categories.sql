-- Migration 027: Product Categories (Generic Category System)
-- Additive / non-destructive only
-- Keeps games.category (legacy Game Genre) untouched

-- 1. Create product_categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_active ON public.product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_sort ON public.product_categories(sort_order);

-- 2. Add product_category_id to games (nullable FK)
DO $$
BEGIN
  ALTER TABLE public.games
    ADD COLUMN product_category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_games_product_category ON public.games(product_category_id);

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS set_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER set_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Customer: read only active categories
DROP POLICY IF EXISTS "Public read active product categories" ON public.product_categories;
CREATE POLICY "Public read active product categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

-- Admin: full access
DROP POLICY IF EXISTS "Admin manage product categories" ON public.product_categories;
CREATE POLICY "Admin manage product categories" ON public.product_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 5. Seed initial categories (idempotent)
INSERT INTO public.product_categories (slug, name, description, is_active, sort_order)
VALUES
  ('topup-uid', 'เติมเกมแบบ UID', 'บริการเติมเกมโดยใช้ UID / Player ID / OpenID', true, 1),
  ('topup-id-pass', 'เติมเกมแบบ ID-Pass', 'บริการเติมเกมโดยใช้ Username + Password', true, 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- 6. Safe data mapping based on actual game_fields
DO $$
DECLARE
  uid_cat UUID;
  idpass_cat UUID;
  g RECORD;
  has_password BOOLEAN;
  has_uid_like BOOLEAN;
BEGIN
  SELECT id INTO uid_cat FROM public.product_categories WHERE slug = 'topup-uid';
  SELECT id INTO idpass_cat FROM public.product_categories WHERE slug = 'topup-id-pass';

  FOR g IN SELECT id, slug FROM public.games LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.game_fields gf
      WHERE gf.game_id = g.id
        AND (
          gf.type = 'password'
          OR lower(gf.key) IN ('password', 'pass', 'pwd')
          OR lower(gf.name) IN ('password', 'pass', 'pwd')
        )
    ) INTO has_password;

    SELECT EXISTS (
      SELECT 1 FROM public.game_fields gf
      WHERE gf.game_id = g.id
        AND (
          lower(gf.key) IN ('uid', 'openid', 'open_id', 'user_id', 'playerid', 'player_id', 'riot_id', 'id')
          OR lower(gf.name) IN ('uid', 'openid', 'open_id', 'user_id', 'playerid', 'player_id', 'riot_id')
        )
    ) INTO has_uid_like;

    IF has_password THEN
      UPDATE public.games
      SET product_category_id = idpass_cat
      WHERE id = g.id AND product_category_id IS NULL;
    ELSIF has_uid_like THEN
      UPDATE public.games
      SET product_category_id = uid_cat
      WHERE id = g.id AND product_category_id IS NULL;
    END IF;
  END LOOP;
END $$;
