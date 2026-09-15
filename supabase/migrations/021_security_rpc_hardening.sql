-- 021_security_rpc_hardening.sql
-- Security hardening for SECURITY DEFINER functions, RPC execution permissions, and search_path isolation.

-- 1. Helper Functions: is_admin and is_reseller
-- Ensure explicit search_path and stable evaluation against profiles table
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

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_reseller() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_reseller() TO anon, authenticated, service_role;

-- 2. Auth Trigger Function: handle_new_user
-- Must only be executed by Postgres trigger system, not directly exposed via RPC to client roles
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

-- 3. Admin Operation: admin_mark_order_paid
-- Strictly checks admin role and isolates search_path
CREATE OR REPLACE FUNCTION public.admin_mark_order_paid(p_order_number text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  o public.orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

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

REVOKE EXECUTE ON FUNCTION public.admin_mark_order_paid(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mark_order_paid(text) TO authenticated, service_role;

-- 4. Admin Operation: admin_credit_wallet
-- Strictly checks admin role and isolates search_path
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
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
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

REVOKE EXECUTE ON FUNCTION public.admin_credit_wallet(UUID, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_credit_wallet(UUID, NUMERIC, TEXT) TO authenticated, service_role;

-- 5. Business Logic: award_points_for_order
-- Enforce authorization (admin or service_role only), enforce order status = SUCCESS, and prevent duplicate points
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
  -- Authorization check: only admin or backend service_role can trigger point rewards
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

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
  VALUES (v_user, v_pts, v_bal, 'ออเดอร์สำเร็จ', p_order_id);

  RETURN v_pts;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_points_for_order(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_points_for_order(UUID) TO authenticated, service_role;

-- 6. Customer Wallet Payment: pay_order_with_wallet
-- Must be authenticated, atomic balance locking, idempotent status check
CREATE OR REPLACE FUNCTION public.pay_order_with_wallet(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_bal NUMERIC;
  v_new NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'ต้องล็อกอินก่อนทำรายการ');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่พบออเดอร์');
  END IF;

  IF v_order.user_id IS NULL OR v_order.user_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่มีสิทธิ์ชำระออเดอร์ของผู้อื่น');
  END IF;

  IF v_order.status <> 'PENDING_PAYMENT' THEN
    RETURN jsonb_build_object('success', false, 'message', 'ออเดอร์นี้ชำระแล้วหรือสถานะไม่ถูกต้อง');
  END IF;

  IF v_order.total IS NULL OR v_order.total <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'ยอดชำระของออเดอร์ไม่ถูกต้อง');
  END IF;

  SELECT balance INTO v_bal FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_bal IS NULL OR v_bal < v_order.total THEN
    RETURN jsonb_build_object('success', false, 'message', 'ยอดเงินในกระเป๋าไม่เพียงพอ');
  END IF;

  v_new := v_bal - v_order.total;
  UPDATE public.wallets SET balance = v_new, updated_at = now() WHERE user_id = auth.uid();

  INSERT INTO public.wallet_ledger (user_id, amount, balance_after, reason, ref_type, ref_id)
  VALUES (auth.uid(), -v_order.total, v_new, 'ชำระออเดอร์ ' || v_order.order_number, 'order_pay', v_order.id::text);

  UPDATE public.orders
  SET status = 'PAID', updated_at = now()
  WHERE id = v_order.id;

  UPDATE public.payments
  SET status = 'PAID', paid_at = now(), updated_at = now()
  WHERE order_id = v_order.id AND status = 'PENDING';

  RETURN jsonb_build_object('success', true, 'balance', v_new, 'order_number', v_order.order_number);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID) TO authenticated, service_role;

-- 7. Public Tracking Functions: get_order_by_number and get_payment_for_order
-- Isolate search_path and select only non-sensitive order tracking data
CREATE OR REPLACE FUNCTION public.get_order_by_number(p_order_number text)
RETURNS TABLE (
  id uuid,
  order_number text,
  status text,
  total numeric,
  subtotal numeric,
  contact_email text,
  contact_phone text,
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
    o.contact_email, o.contact_phone, o.player_data,
    o.game_id, o.product_id, o.created_at, o.updated_at
  FROM public.orders o
  WHERE o.order_number = upper(trim(p_order_number))
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_order_by_number(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon, authenticated, service_role;

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

REVOKE EXECUTE ON FUNCTION public.get_payment_for_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_for_order(text) TO anon, authenticated, service_role;
