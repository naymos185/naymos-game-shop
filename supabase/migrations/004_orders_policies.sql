-- Phase 4: Orders table ensure + RLS for create & track
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_id UUID NOT NULL REFERENCES public.games(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  player_data JSONB NOT NULL DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  provider_id UUID,
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN (
      'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SUCCESS',
      'FAILED', 'REFUND_PENDING', 'REFUNDED', 'CANCELLED'
    )),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone insert orders" ON public.orders;
CREATE POLICY "Anyone insert orders" ON public.orders
  FOR INSERT WITH CHECK (
    (user_id IS NULL) OR (auth.uid() = user_id)
  );

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins read all orders" ON public.orders;
    CREATE POLICY "Admins read all orders" ON public.orders
      FOR SELECT USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
    CREATE POLICY "Admins update orders" ON public.orders
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

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
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.get_order_by_number(text) TO anon, authenticated;

COMMENT ON FUNCTION public.get_order_by_number IS 'Public order tracking by order number (Phase 4)';
