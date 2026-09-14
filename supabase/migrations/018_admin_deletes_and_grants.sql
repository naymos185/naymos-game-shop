-- Grant DELETE permissions to authenticated admins and service role
GRANT DELETE ON public.games TO authenticated, service_role;
GRANT DELETE ON public.products TO authenticated, service_role;
GRANT DELETE ON public.game_fields TO authenticated, service_role;
GRANT DELETE ON public.orders TO authenticated, service_role;
GRANT DELETE ON public.payments TO authenticated, service_role;
GRANT DELETE ON public.coupons TO authenticated, service_role;
GRANT DELETE ON public.promotions TO authenticated, service_role;
GRANT DELETE ON public.banners TO authenticated, service_role;

-- Update RLS policies to allow admins to delete
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins delete games" ON public.games;
    CREATE POLICY "Admins delete games" ON public.games
      FOR DELETE TO authenticated
      USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins delete products" ON public.products;
    CREATE POLICY "Admins delete products" ON public.products
      FOR DELETE TO authenticated
      USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins delete game_fields" ON public.game_fields;
    CREATE POLICY "Admins delete game_fields" ON public.game_fields
      FOR DELETE TO authenticated
      USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
    CREATE POLICY "Admins delete orders" ON public.orders
      FOR DELETE TO authenticated
      USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins delete payments" ON public.payments;
    CREATE POLICY "Admins delete payments" ON public.payments
      FOR DELETE TO authenticated
      USING (public.is_admin());
  END IF;
END $$;
