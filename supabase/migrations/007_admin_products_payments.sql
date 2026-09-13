-- Admin can update products + read all payments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage products" ON public.products;
    CREATE POLICY "Admins manage products" ON public.products
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
    CREATE POLICY "Admins manage payments" ON public.payments
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    DROP POLICY IF EXISTS "Public read active products" ON public.products;
    CREATE POLICY "Public read active products" ON public.products
      FOR SELECT TO anon, authenticated
      USING (is_active = true OR public.is_admin());
  END IF;
END $$;

GRANT SELECT, UPDATE ON public.products TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
