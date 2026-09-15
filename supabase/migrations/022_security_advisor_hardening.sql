-- 022_security_advisor_hardening.sql
-- Security Hardening Round 2: Supabase Security Advisor Resolution
-- 1. Restrict internal / admin RPC execution to service_role
-- 2. Revoke anon execution from auth triggers and role helpers
-- 3. Strip sensitive customer contacts (email/phone) from public tracking RPC
-- 4. Retain SECURITY DEFINER only where strictly required for RLS recursion bypass and system operations

-- 1. Auth Trigger: handle_new_user
-- Triggers are invoked internally by Postgres upon user creation in auth.users.
-- Must never be directly invocable via PostgREST RPC by anon or authenticated clients.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_admin, postgres, service_role;

-- 2. Role Check Helpers: is_admin and is_reseller
-- Must remain SECURITY DEFINER to avoid infinite recursion when evaluated in RLS policies on public.profiles.
-- Anonymous visitors never have a UID, so revoke anon execution to eliminate unauthenticated RPC exposure.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_reseller()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('reseller', 'admin', 'super_admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_reseller() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_reseller() TO authenticated, service_role;

-- 3. Admin Operation: admin_credit_wallet
-- Strictly server-side only. Revoke execute from anon and authenticated clients.
CREATE OR REPLACE FUNCTION public.admin_credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_reason TEXT DEFAULT 'แอดมินเติมเครดิต'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_bal NUMERIC;
BEGIN
  -- Strict validation
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  INSERT INTO public.wallets (user_id, balance, updated_at)
  VALUES (p_user_id, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = public.wallets.balance + p_amount,
      updated_at = now()
  RETURNING balance INTO v_bal;

  INSERT INTO public.wallet_ledger (user_id, amount, balance_after, reason, ref_type)
  VALUES (p_user_id, p_amount, v_bal, COALESCE(p_reason, 'แอดมินเติมเครดิต'), 'admin_credit');

  RETURN v_bal;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_credit_wallet(UUID, NUMERIC, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_credit_wallet(UUID, NUMERIC, TEXT) TO service_role;

-- 4. Admin Operation: admin_mark_order_paid
-- Strictly server-side only. Revoke execute from anon and authenticated clients.
CREATE OR REPLACE FUNCTION public.admin_mark_order_paid(p_order_number text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  o public.orders%ROWTYPE;
BEGIN
  SELECT * INTO o FROM public.orders
  WHERE order_number = upper(trim(p_order_number))
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  UPDATE public.orders
  SET status = 'PAID', updated_at = now()
  WHERE id = o.id AND status IN ('PENDING_PAYMENT', 'PAID');

  UPDATE public.payments
  SET status = 'PAID', paid_at = COALESCE(paid_at, now()), updated_at = now()
  WHERE order_id = o.id AND status = 'PENDING';

  RETURN json_build_object('success', true, 'order_number', o.order_number, 'status', 'PAID');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_mark_order_paid(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_order_paid(text) TO service_role;

-- 5. Business Logic: award_points_for_order
-- Server-side fulfillment operation only. Prevent clients from self-awarding points.
CREATE OR REPLACE FUNCTION public.award_points_for_order(p_order_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user UUID;
  v_total NUMERIC;
  v_status TEXT;
  v_pts INT;
  v_bal INT;
BEGIN
  SELECT user_id, total, status INTO v_user, v_total, v_status
  FROM public.orders WHERE id = p_order_id;

  -- Only SUCCESS orders earn reward points
  IF v_user IS NULL OR v_status IS DISTINCT FROM 'SUCCESS' THEN
    RETURN 0;
  END IF;

  -- Idempotency check: point_ledger already contains reward for this order
  IF EXISTS (
    SELECT 1 FROM public.point_ledger
    WHERE order_id = p_order_id AND amount > 0
  ) THEN
    RETURN 0;
  END IF;

  v_pts := FLOOR(COALESCE(v_total, 0) / 10)::INT;
  IF v_pts <= 0 THEN
    RETURN 0;
  END IF;

  INSERT INTO public.point_balances (user_id, balance, updated_at)
  VALUES (v_user, v_pts, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = public.point_balances.balance + v_pts,
      updated_at = now()
  RETURNING balance INTO v_bal;

  INSERT INTO public.point_ledger (user_id, amount, balance_after, reason, order_id)
  VALUES (v_user, v_pts, v_bal, 'คะแนนสะสมคำสั่งซื้อ', p_order_id);

  RETURN v_pts;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_points_for_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_points_for_order(UUID) TO service_role;

-- 6. Customer Wallet Payment: pay_order_with_wallet
-- Route through server endpoint with atomic row-level locks and idempotency.
-- Revoke direct PostgREST RPC access from anon and authenticated.
CREATE OR REPLACE FUNCTION public.pay_order_with_wallet(
  p_order_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_bal NUMERIC;
  v_new NUMERIC;
  v_effective_user UUID;
BEGIN
  v_effective_user := COALESCE(p_user_id, auth.uid());
  IF v_effective_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'กรุณาเข้าสู่ระบบก่อนทำรายการ');
  END IF;

  -- Atomic row lock on order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่พบออเดอร์');
  END IF;

  IF v_order.user_id IS NULL OR v_order.user_id <> v_effective_user THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่อนุญาตให้ชำระออเดอร์ของผู้อื่น');
  END IF;

  IF v_order.status <> 'PENDING_PAYMENT' THEN
    RETURN jsonb_build_object('success', false, 'message', 'ออเดอร์นี้ได้รับการชำระเงินหรือเสร็จสิ้นแล้ว');
  END IF;

  IF v_order.total IS NULL OR v_order.total <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'ยอดชำระออเดอร์ไม่ถูกต้อง');
  END IF;

  -- Atomic row lock on wallet
  SELECT balance INTO v_bal FROM public.wallets WHERE user_id = v_effective_user FOR UPDATE;
  IF v_bal IS NULL OR v_bal < v_order.total THEN
    RETURN jsonb_build_object('success', false, 'message', 'ยอดเงินคงเหลือในกระเป๋าไม่เพียงพอ');
  END IF;

  v_new := v_bal - v_order.total;
  UPDATE public.wallets SET balance = v_new, updated_at = now() WHERE user_id = v_effective_user;

  INSERT INTO public.wallet_ledger (user_id, amount, balance_after, reason, ref_type, ref_id)
  VALUES (v_effective_user, -v_order.total, v_new, 'ชำระออเดอร์ ' || v_order.order_number, 'order_pay', v_order.id::text);

  UPDATE public.orders
  SET status = 'PAID', updated_at = now()
  WHERE id = v_order.id;

  UPDATE public.payments
  SET status = 'PAID', paid_at = now(), updated_at = now()
  WHERE order_id = v_order.id AND status = 'PENDING';

  RETURN jsonb_build_object('success', true, 'balance', v_new, 'order_number', v_order.order_number);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID, UUID) TO service_role;
REVOKE EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID) TO service_role;

-- 7. Public Tracking: get_order_by_number
-- Stripped of private customer details (no contact_email, contact_phone).
-- Routed securely via Next.js server API with service_role.
DROP FUNCTION IF EXISTS public.get_order_by_number(text);
CREATE OR REPLACE FUNCTION public.get_order_by_number(p_order_number text)
RETURNS TABLE (
  id uuid,
  order_number text,
  status text,
  total numeric,
  subtotal numeric,
  player_data jsonb,
  game_id uuid,
  product_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT
    o.id, o.order_number, o.status, o.total, o.subtotal,
    o.player_data, o.game_id, o.product_id, o.created_at, o.updated_at
  FROM public.orders o
  WHERE o.order_number = upper(trim(p_order_number))
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_order_by_number(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO service_role;

-- 8. Payment Tracking: get_payment_for_order
-- Stripped of sensitive secrets. Routed securely via Next.js server API with service_role.
DROP FUNCTION IF EXISTS public.get_payment_for_order(text);
CREATE OR REPLACE FUNCTION public.get_payment_for_order(p_order_number text)
RETURNS TABLE (
  payment_id uuid,
  order_id uuid,
  order_number text,
  order_status text,
  amount numeric,
  payment_status text,
  payment_reference text,
  qr_data text,
  expires_at timestamptz,
  paid_at timestamptz,
  game_id uuid,
  product_id uuid,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT
    p.id, o.id, o.order_number, o.status, p.amount, p.status,
    p.payment_reference, p.qr_data, p.expires_at, p.paid_at,
    o.game_id, o.product_id, p.created_at
  FROM public.orders o
  LEFT JOIN public.payments p ON p.order_id = o.id
  WHERE o.order_number = upper(trim(p_order_number))
  ORDER BY p.created_at DESC NULLS LAST
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_payment_for_order(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_payment_for_order(text) TO service_role;
