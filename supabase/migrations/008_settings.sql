CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read settings" ON public.system_settings;
CREATE POLICY "Anyone read settings" ON public.system_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins write settings" ON public.system_settings;
    CREATE POLICY "Admins write settings" ON public.system_settings
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.system_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.system_settings TO authenticated;

INSERT INTO public.system_settings (key, value) VALUES
  ('store', '{
    "name": "NayMos GameShop",
    "promptpay_id": "",
    "bank_name": "พร้อมเพย์",
    "account_name": "NayMos GameShop"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
