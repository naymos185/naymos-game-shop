CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.point_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.point_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_point_ledger_user ON public.point_ledger(user_id, created_at DESC);

ALTER TABLE public.point_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own balance" ON public.point_balances;
CREATE POLICY "Users read own balance" ON public.point_balances
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own ledger" ON public.point_ledger;
CREATE POLICY "Users read own ledger" ON public.point_ledger
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins read all balances" ON public.point_balances;
    CREATE POLICY "Admins read all balances" ON public.point_balances
      FOR SELECT TO authenticated
      USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins read all ledger" ON public.point_ledger;
    CREATE POLICY "Admins read all ledger" ON public.point_ledger
      FOR SELECT TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.point_balances TO authenticated;
GRANT SELECT ON public.point_ledger TO authenticated;

CREATE OR REPLACE FUNCTION public.award_points_for_order(p_order_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID;
  v_total NUMERIC;
  v_pts INT;
  v_bal INT;
BEGIN
  SELECT user_id, total INTO v_user, v_total
  FROM public.orders WHERE id = p_order_id;

  IF v_user IS NULL THEN
    RETURN 0;
  END IF;

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

GRANT EXECUTE ON FUNCTION public.award_points_for_order(UUID) TO authenticated, service_role;
