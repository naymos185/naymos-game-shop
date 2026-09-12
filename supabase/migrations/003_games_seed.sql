-- Phase 3: Ensure game tables + seed 6 games
-- Safe to re-run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  banner TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  placeholder TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  options JSONB,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, name)
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'THB',
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  provider_product_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active games" ON public.games;
CREATE POLICY "Public read active games" ON public.games FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read game fields" ON public.game_fields;
CREATE POLICY "Public read game fields" ON public.game_fields FOR SELECT USING (true);

INSERT INTO public.games (slug, name, description, category, is_active, sort_order) VALUES
  ('free-fire', 'Free Fire', 'เติมเพชร Free Fire รวดเร็ว ปลอดภัย', 'Battle Royale', true, 1),
  ('rov', 'RoV', 'เติมคูปอง RoV ระบบอัตโนมัติ', 'MOBA', true, 2),
  ('mobile-legends', 'Mobile Legends', 'เติม Diamonds MLBB', 'MOBA', true, 3),
  ('valorant', 'Valorant', 'เติม Valorant Points', 'FPS', true, 4),
  ('genshin-impact', 'Genshin Impact', 'เติม Genesis Crystals', 'RPG', true, 5),
  ('pubg-mobile', 'PUBG Mobile', 'เติม UC PUBG Mobile', 'Battle Royale', true, 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_active = true;

-- Free Fire fields + products
DO $$
DECLARE g UUID;
BEGIN
  SELECT id INTO g FROM public.games WHERE slug = 'free-fire';
  INSERT INTO public.game_fields (game_id, name, label, placeholder, required, sort_order)
  VALUES (g, 'uid', 'Player ID (UID)', 'กรอก UID', true, 1) ON CONFLICT (game_id, name) DO NOTHING;
  INSERT INTO public.products (game_id, name, amount, price, sort_order)
  SELECT g, x.n, x.a, x.p, x.o FROM (VALUES
    ('100 เพชร',100,29,1),('310 เพชร',310,89,2),('520 เพชร',520,149,3),
    ('1,060 เพชร',1060,299,4),('2,180 เพชร',2180,599,5),('5,600 เพชร',5600,1499,6)
  ) AS x(n,a,p,o)
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE game_id=g AND name=x.n);

  SELECT id INTO g FROM public.games WHERE slug = 'rov';
  INSERT INTO public.game_fields (game_id, name, label, placeholder, required, sort_order)
  VALUES (g, 'openid', 'Open ID', 'กรอก Open ID', true, 1) ON CONFLICT (game_id, name) DO NOTHING;
  INSERT INTO public.products (game_id, name, amount, price, sort_order)
  SELECT g, x.n, x.a, x.p, x.o FROM (VALUES
    ('35 คูปอง',35,35,1),('90 คูปอง',90,90,2),('230 คูปอง',230,230,3),
    ('470 คูปอง',470,470,4),('950 คูปอง',950,950,5)
  ) AS x(n,a,p,o)
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE game_id=g AND name=x.n);

  SELECT id INTO g FROM public.games WHERE slug = 'mobile-legends';
  INSERT INTO public.game_fields (game_id, name, label, placeholder, required, sort_order) VALUES
    (g, 'user_id', 'User ID', 'กรอก User ID', true, 1),
    (g, 'zone_id', 'Zone ID', 'กรอก Zone ID', true, 2)
  ON CONFLICT (game_id, name) DO NOTHING;
  INSERT INTO public.products (game_id, name, amount, price, sort_order)
  SELECT g, x.n, x.a, x.p, x.o FROM (VALUES
    ('86 Diamonds',86,29,1),('172 Diamonds',172,55,2),('257 Diamonds',257,79,3),
    ('344 Diamonds',344,105,4),('706 Diamonds',706,209,5),('2,195 Diamonds',2195,629,6)
  ) AS x(n,a,p,o)
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE game_id=g AND name=x.n);

  SELECT id INTO g FROM public.games WHERE slug = 'valorant';
  INSERT INTO public.game_fields (game_id, name, label, placeholder, required, sort_order) VALUES
    (g, 'riot_id', 'Riot ID', 'ชื่อผู้เล่น', true, 1),
    (g, 'tagline', 'Tagline', 'เช่น TH1', true, 2),
    (g, 'region', 'Region', 'AP / EU / NA', true, 3)
  ON CONFLICT (game_id, name) DO NOTHING;
  INSERT INTO public.products (game_id, name, amount, price, sort_order)
  SELECT g, x.n, x.a, x.p, x.o FROM (VALUES
    ('475 VP',475,159,1),('1,000 VP',1000,319,2),('2,050 VP',2050,639,3),
    ('3,650 VP',3650,1119,4),('5,350 VP',5350,1599,5)
  ) AS x(n,a,p,o)
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE game_id=g AND name=x.n);

  SELECT id INTO g FROM public.games WHERE slug = 'genshin-impact';
  INSERT INTO public.game_fields (game_id, name, label, placeholder, required, sort_order) VALUES
    (g, 'uid', 'UID', 'UID 8-9 หลัก', true, 1),
    (g, 'server', 'Server', 'Asia / Europe / America', true, 2)
  ON CONFLICT (game_id, name) DO NOTHING;
  INSERT INTO public.products (game_id, name, amount, price, sort_order)
  SELECT g, x.n, x.a, x.p, x.o FROM (VALUES
    ('60 Genesis Crystals',60,35,1),('300 Genesis Crystals',300,175,2),
    ('980 Genesis Crystals',980,559,3),('1,980 Genesis Crystals',1980,1119,4),
    ('3,280 Genesis Crystals',3280,1839,5),('Blessing of the Welkin Moon',1,159,6)
  ) AS x(n,a,p,o)
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE game_id=g AND name=x.n);

  SELECT id INTO g FROM public.games WHERE slug = 'pubg-mobile';
  INSERT INTO public.game_fields (game_id, name, label, placeholder, required, sort_order)
  VALUES (g, 'uid', 'Player ID', 'กรอก Player ID', true, 1) ON CONFLICT (game_id, name) DO NOTHING;
  INSERT INTO public.products (game_id, name, amount, price, sort_order)
  SELECT g, x.n, x.a, x.p, x.o FROM (VALUES
    ('60 UC',60,29,1),('325 UC',325,149,2),('660 UC',660,299,3),
    ('1,800 UC',1800,749,4),('3,850 UC',3850,1499,5)
  ) AS x(n,a,p,o)
  WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE game_id=g AND name=x.n);
END $$;
