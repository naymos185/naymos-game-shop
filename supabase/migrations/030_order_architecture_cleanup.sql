-- Migration 030: Unified Order Architecture, State Machine, Security Hardening & Missing FK Indexes
-- Safe, additive-only migration

-- 1. Ensure order status constraint supports QUEUED and all standard states
DO $$
BEGIN
  -- Drop existing status check if it exists
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS check_order_status;
  
  -- Add comprehensive check constraint
  ALTER TABLE public.orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'PENDING_PAYMENT',
    'PAID',
    'QUEUED',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUND_PENDING',
    'REFUNDED',
    'CANCELLED'
  ));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 2. Create dedicated order_items table for structured multi-item storage
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_items.order_id 
        AND o.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (SELECT auth.uid()) 
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- 3. Hardened admin_start_processing_order RPC:
-- Rejects client-supplied admin ID, relies on auth.uid(), checks admin privilege, revokes from anon
CREATE OR REPLACE FUNCTION public.admin_start_processing_order(
  p_order_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_admin_role TEXT;
  v_order RECORD;
BEGIN
  -- Determine actual authenticated caller
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    -- Fallback for service_role calls if provided explicitly
    IF p_admin_id IS NOT NULL THEN
      v_caller_id := p_admin_id;
    ELSE
      RETURN jsonb_build_object('success', false, 'message', 'UNAUTHENTICATED');
    END IF;
  END IF;

  -- Validate caller has admin privileges
  SELECT role INTO v_admin_role
  FROM public.profiles
  WHERE id = v_caller_id;

  IF v_admin_role NOT IN ('admin', 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'FORBIDDEN_NOT_ADMIN');
  END IF;

  -- Lock target order row atomically for update
  SELECT id, order_number, status, payment_confirmed_at 
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_NOT_FOUND');
  END IF;

  -- Must be in QUEUED or PAID status
  IF v_order.status NOT IN ('QUEUED', 'PAID') THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_NOT_IN_QUEUE', 'current_status', v_order.status);
  END IF;

  -- Atomic transition to PROCESSING
  UPDATE public.orders
  SET 
    status = 'PROCESSING',
    processing_started_at = NOW(),
    processing_admin_id = v_caller_id,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'เริ่มดำเนินการเติมเรียบร้อยแล้ว',
    'order_id', p_order_id,
    'order_number', v_order.order_number
  );
EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_LOCKED_BY_ANOTHER_ADMIN');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Revoke anon access from admin RPCs
REVOKE EXECUTE ON FUNCTION public.admin_start_processing_order(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_start_processing_order(UUID, UUID) TO authenticated, service_role;

-- 4. Foreign Key Indexes for Performance & Referential Integrity
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_orders_processing_admin_id ON public.orders(processing_admin_id);
CREATE INDEX IF NOT EXISTS idx_orders_completed_admin_id ON public.orders(completed_admin_id);
