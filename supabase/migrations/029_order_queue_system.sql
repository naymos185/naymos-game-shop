-- Migration 029: Real-time Order Queue System & Manual Fulfillment Workflow
-- Safe, additive-only migration

-- Add queue and fulfillment tracking columns to orders if not exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS completed_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for high-performance FIFO queue ordering
CREATE INDEX IF NOT EXISTS idx_orders_queue_ordering 
ON public.orders (status, payment_confirmed_at ASC) 
WHERE status = 'QUEUED';

-- RPC: Atomically start processing an order from queue (prevents race condition between admins)
CREATE OR REPLACE FUNCTION public.admin_start_processing_order(
  p_order_id UUID,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_queue_head UUID;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'UNAUTHORIZED');
  END IF;

  -- Lock the target order row for update
  SELECT id, order_number, status, payment_confirmed_at 
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_NOT_FOUND');
  END IF;

  -- Verify order is in QUEUED or PAID status
  IF v_order.status NOT IN ('QUEUED', 'PAID') THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_NOT_IN_QUEUE', 'current_status', v_order.status);
  END IF;

  -- Atomically transition to PROCESSING
  UPDATE public.orders
  SET 
    status = 'PROCESSING',
    processing_started_at = NOW(),
    processing_admin_id = p_admin_id,
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

-- RPC: Atomically complete an order (transition from PROCESSING to SUCCESS)
CREATE OR REPLACE FUNCTION public.admin_complete_order(
  p_order_id UUID,
  p_admin_id UUID,
  p_fulfilled_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'UNAUTHORIZED');
  END IF;

  -- Lock row for update
  SELECT id, order_number, status, user_id, player_data
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_NOT_FOUND');
  END IF;

  IF v_order.status != 'PROCESSING' THEN
    RETURN jsonb_build_object('success', false, 'message', 'ORDER_NOT_PROCESSING', 'current_status', v_order.status);
  END IF;

  -- Update order to SUCCESS
  UPDATE public.orders
  SET 
    status = 'SUCCESS',
    completed_at = NOW(),
    completed_admin_id = p_admin_id,
    player_data = jsonb_set(
      COALESCE(v_order.player_data, '{}'::jsonb),
      '{_fulfilled_items}',
      p_fulfilled_items,
      true
    ),
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Create customer notification if notifications table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') AND v_order.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, link, type)
    VALUES (
      v_order.user_id,
      'เติมเกมสำเร็จเรียบร้อย',
      'ออเดอร์ ' || v_order.order_number || ' ดำเนินการเติมเกมสำเร็จแล้ว ขอบคุณที่ใช้บริการครับ',
      '/order-tracking?number=' || v_order.order_number,
      'order_completed'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'ยืนยันการเติมสำเร็จเรียบร้อยแล้ว',
    'order_id', p_order_id,
    'order_number', v_order.order_number
  );
END;
$$;
