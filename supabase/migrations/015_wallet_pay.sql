CREATE OR REPLACE FUNCTION public.pay_order_with_wallet(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_bal NUMERIC;
  v_new NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'ต้องล็อกอิน');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่พบออเดอร์');
  END IF;

  IF v_order.user_id IS NULL OR v_order.user_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่ใช่ออเดอร์ของคุณ');
  END IF;

  IF v_order.status <> 'PENDING_PAYMENT' THEN
    RETURN jsonb_build_object('success', false, 'message', 'ออเดอร์นี้ชำระแล้วหรือสถานะไม่ถูกต้อง');
  END IF;

  SELECT balance INTO v_bal FROM public.wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_bal IS NULL OR v_bal < v_order.total THEN
    RETURN jsonb_build_object('success', false, 'message', 'เครดิตไม่พอ');
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

GRANT EXECUTE ON FUNCTION public.pay_order_with_wallet(UUID) TO authenticated;
