import { createClient } from '@/lib/supabase/server';

export type CouponResult =
  | {
      valid: true;
      code: string;
      discount_type: 'fixed' | 'percent';
      discount_value: number;
      discount_amount: number;
    }
  | { valid: false; message: string };

export function calcDiscount(
  subtotal: number,
  discountType: 'fixed' | 'percent',
  discountValue: number
): number {
  let d =
    discountType === 'percent'
      ? (subtotal * discountValue) / 100
      : discountValue;
  d = Math.min(d, subtotal);
  return Math.round(d * 100) / 100;
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const c = code.trim().toUpperCase();
  if (!c) return { valid: false, message: 'ไม่มีโค้ดคูปอง' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', c)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, message: 'ไม่พบคูปองนี้' };
  }
  if (!data.is_active) {
    return { valid: false, message: 'คูปองนี้ปิดใช้งาน' };
  }
  const now = Date.now();
  if (data.starts_at && new Date(data.starts_at).getTime() > now) {
    return { valid: false, message: 'คูปองยังไม่เริ่มใช้' };
  }
  if (data.expires_at && new Date(data.expires_at).getTime() < now) {
    return { valid: false, message: 'คูปองหมดอายุแล้ว' };
  }
  if (data.max_uses != null && data.used_count >= data.max_uses) {
    return { valid: false, message: 'คูปองถูกใช้ครบจำนวนแล้ว' };
  }
  if (Number(data.min_order_amount) > subtotal) {
    return {
      valid: false,
      message: `ยอดขั้นต่ำ ฿${Number(data.min_order_amount)}`,
    };
  }

  const discountType = data.discount_type as 'fixed' | 'percent';
  const discountValue = Number(data.discount_value);
  const discount_amount = calcDiscount(subtotal, discountType, discountValue);

  return {
    valid: true,
    code: data.code,
    discount_type: discountType,
    discount_value: discountValue,
    discount_amount,
  };
}

export async function incrementCouponUsage(code: string) {
  const supabase = await createClient();
  const c = code.trim().toUpperCase();
  const { data } = await supabase
    .from('coupons')
    .select('id, used_count')
    .eq('code', c)
    .maybeSingle();
  if (!data) return;
  await supabase
    .from('coupons')
    .update({
      used_count: (data.used_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id);
}
