CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'closed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_status ON public.support_tickets(status, created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert ticket" ON public.support_tickets;
CREATE POLICY "Anyone insert ticket" ON public.support_tickets
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own tickets" ON public.support_tickets;
CREATE POLICY "Users read own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage tickets" ON public.support_tickets;
    CREATE POLICY "Admins manage tickets" ON public.support_tickets
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT, INSERT ON public.support_tickets TO anon, authenticated;
GRANT UPDATE ON public.support_tickets TO authenticated;
