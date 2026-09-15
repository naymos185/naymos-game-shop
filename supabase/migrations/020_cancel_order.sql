CREATE OR REPLACE FUNCTION public.cancel_own_order(p_order_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT id, user_id, status INTO v_order
  FROM public.orders
  WHERE order_number = upper(trim(p_order_number));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่พบออเดอร์');
  END IF;

  IF v_order.status <> 'PENDING_PAYMENT' THEN
    RETURN jsonb_build_object('success', false, 'message', 'ยกเลิกได้เฉพาะรอชำระ');
  END IF;

  IF v_order.user_id IS NOT NULL AND auth.uid() IS DISTINCT FROM v_order.user_id AND NOT COALESCE(public.is_admin(), false) THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่มีสิทธิ์');
  END IF;

  UPDATE public.orders
  SET status = 'CANCELLED', updated_at = now(), notes = COALESCE(notes, '') || ' | cancelled by user'
  WHERE id = v_order.id;

  UPDATE public.payments
  SET status = 'CANCELLED', updated_at = now()
  WHERE order_id = v_order.id AND status = 'PENDING';

  RETURN jsonb_build_object('success', true, 'message', 'ยกเลิกออเดอร์แล้ว');
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_own_order(TEXT) TO anon, authenticated;
