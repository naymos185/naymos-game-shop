ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS slip_note TEXT,
  ADD COLUMN IF NOT EXISTS slip_url TEXT,
  ADD COLUMN IF NOT EXISTS slip_submitted_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "Submit slip on pending payment" ON public.payments;
CREATE POLICY "Submit slip on pending payment" ON public.payments
  FOR UPDATE TO anon, authenticated
  USING (status = 'PENDING')
  WITH CHECK (status = 'PENDING');

CREATE OR REPLACE FUNCTION public.submit_payment_slip(
  p_order_number TEXT,
  p_slip_note TEXT DEFAULT NULL,
  p_slip_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_payment_id UUID;
BEGIN
  SELECT id, status INTO v_order
  FROM public.orders
  WHERE order_number = upper(trim(p_order_number));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่พบออเดอร์');
  END IF;

  IF v_order.status <> 'PENDING_PAYMENT' THEN
    RETURN jsonb_build_object('success', false, 'message', 'ออเดอร์นี้ไม่รอชำระแล้ว');
  END IF;

  IF (p_slip_note IS NULL OR trim(p_slip_note) = '')
     AND (p_slip_url IS NULL OR trim(p_slip_url) = '') THEN
    RETURN jsonb_build_object('success', false, 'message', 'กรุณาใส่หมายเหตุหรือลิงก์สลิป');
  END IF;

  SELECT id INTO v_payment_id
  FROM public.payments
  WHERE order_id = v_order.id AND status = 'PENDING'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_payment_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่พบรายการชำระเงิน');
  END IF;

  UPDATE public.payments
  SET
    slip_note = NULLIF(trim(p_slip_note), ''),
    slip_url = NULLIF(trim(p_slip_url), ''),
    slip_submitted_at = now(),
    updated_at = now()
  WHERE id = v_payment_id;

  RETURN jsonb_build_object('success', true, 'message', 'ส่งหลักฐานการโอนแล้ว รอแอดมินตรวจสอบ');
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_payment_slip(TEXT, TEXT, TEXT) TO anon, authenticated;
