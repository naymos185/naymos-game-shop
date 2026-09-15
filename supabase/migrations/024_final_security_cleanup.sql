-- ==============================================================================
-- 024_final_security_cleanup.sql
-- NayMos GameShop - Final Production Security & Database Hardening
-- ==============================================================================

-- 1. Prevent Role Escalation on public.profiles
-- Ensure regular users cannot update their own role column via direct Supabase Data API
CREATE OR REPLACE FUNCTION public.protect_profiles_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow change only if executing as service_role or admin
    IF NOT (auth.role() = 'service_role' OR public.is_admin()) THEN
      RAISE EXCEPTION 'Cannot modify role: unauthorized';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_role ON public.profiles;
CREATE TRIGGER trg_protect_profiles_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_role();

-- 2. Drop Proven Duplicate RLS Policies
-- Table: orders (Keep "Users can read own orders", drop duplicate "Users read own orders")
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;

-- Table: profiles (Keep "Users can update own profile", drop duplicate "Users update own profile")
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Table: wallet_ledger (Keep "Users read own ledger", drop duplicate "Users read own wallet ledger")
DROP POLICY IF EXISTS "Users read own wallet ledger" ON public.wallet_ledger;

-- Table: games (Drop redundant "Admins delete games" as "Admins manage games" already covers ALL)
DROP POLICY IF EXISTS "Admins delete games" ON public.games;

-- Table: products (Drop redundant "Admins delete products" as "Admins manage products" covers ALL)
DROP POLICY IF EXISTS "Admins delete products" ON public.products;

-- Table: payments (Drop redundant "Admins delete payments" as "Admins manage payments" covers ALL)
DROP POLICY IF EXISTS "Admins delete payments" ON public.payments;

-- 3. Hardening support_tickets RLS
-- Strict separation between authenticated user tickets and anonymous guest tickets
DROP POLICY IF EXISTS "Authenticated users insert own ticket" ON public.support_tickets;
DROP POLICY IF EXISTS "Anon insert ticket" ON public.support_tickets;

CREATE POLICY "Authenticated users insert own ticket" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anon insert ticket" ON public.support_tickets
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- 4. Restrict system_settings public read
-- Ensure secret credentials cannot be read publicly by anon or customers
DROP POLICY IF EXISTS "Anyone read settings" ON public.system_settings;
DROP POLICY IF EXISTS "Anyone read public settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins read all settings" ON public.system_settings;

CREATE POLICY "Anyone read public settings" ON public.system_settings
  FOR SELECT TO anon, authenticated
  USING (key = 'store' OR key LIKE 'public_%');

CREATE POLICY "Admins read all settings" ON public.system_settings
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 5. Drop Unused RPC Overload
-- Remove single-argument pay_order_with_wallet(UUID) from 015, leaving hardened pay_order_with_wallet(UUID, UUID)
DROP FUNCTION IF EXISTS public.pay_order_with_wallet(UUID);

-- 6. Ensure payments table updates are revoked from public / non-admin
REVOKE UPDATE ON public.payments FROM PUBLIC, anon;

-- Ensure is_admin() and is_reseller() have secure search_path and public access revoked
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_reseller() SET search_path = public, pg_temp;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_reseller() FROM PUBLIC, anon;
