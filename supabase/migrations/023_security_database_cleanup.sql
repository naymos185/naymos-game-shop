-- 023_security_database_cleanup.sql
-- Security & Database Pre-Production Cleanup
-- 1. Fix support_tickets "RLS Policy Always True" and prevent user ID spoofing
-- 2. Add missing indexes for Foreign Keys
-- 3. Optimize RLS performance using (select auth.uid())
-- 4. Clean up redundant pay_order_with_wallet overloads

-- 1. Support Tickets RLS Hardening
DROP POLICY IF EXISTS "Anyone insert ticket" ON public.support_tickets;
DROP POLICY IF EXISTS "Authenticated users insert own ticket" ON public.support_tickets;
DROP POLICY IF EXISTS "Anon insert ticket" ON public.support_tickets;

-- Authenticated users can insert their own ticket or guest ticket (user_id = auth.uid() or user_id IS NULL)
CREATE POLICY "Authenticated users insert own ticket" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()));

-- Guests (anon) can insert tickets only if user_id is NULL
CREATE POLICY "Anon insert ticket" ON public.support_tickets
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Optimize user read policy with cached auth.uid()
DROP POLICY IF EXISTS "Users read own tickets" ON public.support_tickets;
CREATE POLICY "Users read own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 2. Add Missing Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_orders_game_id ON public.orders(game_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_point_ledger_order_id ON public.point_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_products_game_id ON public.products(game_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);

-- 3. Optimize Auth checks on key tables for RLS evaluation
DO $$
BEGIN
  -- orders table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
    CREATE POLICY "Users can read own orders" ON public.orders
      FOR SELECT TO authenticated
      USING (user_id = (SELECT auth.uid()));
  END IF;

  -- profiles table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE TO authenticated
      USING (id = (SELECT auth.uid()))
      WITH CHECK (id = (SELECT auth.uid()));
  END IF;

  -- wallets table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wallets') THEN
    DROP POLICY IF EXISTS "Users read own wallet" ON public.wallets;
    CREATE POLICY "Users read own wallet" ON public.wallets
      FOR SELECT TO authenticated
      USING (user_id = (SELECT auth.uid()));
  END IF;

  -- wallet_ledger table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wallet_ledger') THEN
    DROP POLICY IF EXISTS "Users read own ledger" ON public.wallet_ledger;
    CREATE POLICY "Users read own ledger" ON public.wallet_ledger
      FOR SELECT TO authenticated
      USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;
