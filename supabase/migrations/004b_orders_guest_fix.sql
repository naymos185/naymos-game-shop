-- Fix guest order insert (RLS)
-- Run in Supabase SQL Editor if guest checkout fails

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;

CREATE POLICY "Anyone insert orders" ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL
    OR auth.uid() = user_id
  );

GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon, authenticated;
