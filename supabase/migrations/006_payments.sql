-- Phase 6: Payments table ensure + RLS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  payment_reference TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED', 'CANCELLED')),
  qr_data TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON public.payments(payment_reference);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

GRANT INSERT, SELECT ON public.payments TO anon, authenticated;
GRANT UPDATE ON public.payments TO authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DROP POLICY IF EXISTS "Insert payment for pending order" ON public.payments;
CREATE POLICY "Insert payment for pending order" ON public.payments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.status = 'PENDING_PAYMENT'
    )
  );

DROP POLICY IF EXISTS "Users read own payments" ON public.payments;
CREATE POLICY "Users read own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
    CREATE POLICY "Admins manage payments" ON public.payments
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

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
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.get_payment_for_order(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_mark_order_paid(p_order_number text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o public.orders%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
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

GRANT EXECUTE ON FUNCTION public.admin_mark_order_paid(text) TO authenticated;
