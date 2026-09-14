CREATE OR REPLACE FUNCTION public.redeem_points_for_order(
  p_user_id UUID,
  p_points INT,
  p_order_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bal INT;
  v_new INT;
BEGIN
  IF p_user_id IS NULL OR p_points IS NULL OR p_points <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'คะแนนไม่ถูกต้อง');
  END IF;

  IF auth.uid() IS DISTINCT FROM p_user_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'ไม่มีสิทธิ์');
  END IF;

  SELECT balance INTO v_bal FROM public.point_balances WHERE user_id = p_user_id FOR UPDATE;
  IF v_bal IS NULL OR v_bal < p_points THEN
    RETURN jsonb_build_object('success', false, 'message', 'คะแนนไม่พอ');
  END IF;

  v_new := v_bal - p_points;
  UPDATE public.point_balances SET balance = v_new, updated_at = now() WHERE user_id = p_user_id;

  INSERT INTO public.point_ledger (user_id, amount, balance_after, reason, order_id)
  VALUES (p_user_id, -p_points, v_new, 'แลกคะแนนลดราคา', p_order_id);

  RETURN jsonb_build_object(
    'success', true,
    'points_used', p_points,
    'discount_thb', FLOOR(p_points / 10.0),
    'balance_after', v_new
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_points_for_order(UUID, INT, UUID) TO authenticated;
