CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user ON public.wallet_ledger(user_id, created_at DESC);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own wallet" ON public.wallets;
CREATE POLICY "Users read own wallet" ON public.wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own wallet ledger" ON public.wallet_ledger;
CREATE POLICY "Users read own wallet ledger" ON public.wallet_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins read wallets" ON public.wallets;
    CREATE POLICY "Admins read wallets" ON public.wallets
      FOR SELECT TO authenticated USING (public.is_admin());
    DROP POLICY IF EXISTS "Admins read wallet ledger" ON public.wallet_ledger;
    CREATE POLICY "Admins read wallet ledger" ON public.wallet_ledger
      FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.wallet_ledger TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_reason TEXT DEFAULT 'แอดมินเติมเครดิต'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bal NUMERIC;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only';
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

GRANT EXECUTE ON FUNCTION public.admin_credit_wallet(UUID, NUMERIC, TEXT) TO authenticated;
