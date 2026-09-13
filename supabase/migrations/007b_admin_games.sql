DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage games" ON public.games;
    CREATE POLICY "Admins manage games" ON public.games
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT, UPDATE ON public.games TO authenticated;
