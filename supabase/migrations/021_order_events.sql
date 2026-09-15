CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON public.order_events(order_id, created_at);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own order events" ON public.order_events;
CREATE POLICY "Users read own order events" ON public.order_events
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
    DROP POLICY IF EXISTS "Admins read order events" ON public.order_events;
    CREATE POLICY "Admins read order events" ON public.order_events
      FOR SELECT TO authenticated USING (public.is_admin());
  END IF;
END $$;

GRANT SELECT ON public.order_events TO authenticated;

CREATE OR REPLACE FUNCTION public.log_order_event(
  p_order_id UUID,
  p_to_status TEXT,
  p_from_status TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL,
  p_actor TEXT DEFAULT 'system'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.order_events (order_id, from_status, to_status, note, actor)
  VALUES (p_order_id, p_from_status, p_to_status, p_note, COALESCE(p_actor, 'system'))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_order_event(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role, anon;

CREATE OR REPLACE FUNCTION public.trg_orders_log_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_order_event(NEW.id, NEW.status, NULL, 'สร้างออเดอร์', 'system');
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.log_order_event(NEW.id, NEW.status, OLD.status, NULL, 'system');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_status_event ON public.orders;
CREATE TRIGGER trg_orders_status_event
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_orders_log_status();
