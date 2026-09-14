import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber } from './order-number';
import type { Order } from '@/types/order';
import {
  validateCoupon,
  incrementCouponUsage,
} from '@/lib/coupons/validate';

export type CreateOrderPayload = {
  game_id: string;
  product_id: string;
  player_data: Record<string, string>;
  contact_email?: string;
  contact_phone?: string;
  coupon_code?: string;
  points_to_use?: number;
};

export type CreateOrderResult =
  | {
      success: true;
      order: Pick<Order, 'id' | 'order_number' | 'status' | 'total'> & {
        discount?: number;
        subtotal?: number;
      };
    }
  | { success: false; message: string };

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResult> {
  if (!payload.game_id || !payload.product_id) {
    return { success: false, message: 'ข้อมูลเกมหรือแพ็กเกจไม่ครบ' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // STRICT REQUIREMENT: Must be logged in to order (No guest orders allowed)
  if (!user) {
    return {
      success: false,
      message: 'กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนทำการสั่งซื้อ เพื่อความปลอดภัย',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isReseller = profile?.role === 'reseller' || profile?.role === 'admin' || profile?.role === 'super_admin';

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, game_id, price, reseller_price, name, is_active')
    .eq('id', payload.product_id)
    .maybeSingle();

  if (productError || !product) {
    return { success: false, message: 'ไม่พบแพ็กเกจที่เลือก' };
  }
  if (!product.is_active) {
    return { success: false, message: 'แพ็กเกจนี้ปิดใช้งานชั่วคราว' };
  }
  if (product.game_id !== payload.game_id) {
    return { success: false, message: 'แพ็กเกจไม่ตรงกับเกม' };
  }

  // Calculate pricing based on role
  let rawPrice = Number(product.price);
  if (isReseller && product.reseller_price != null && Number(product.reseller_price) > 0) {
    rawPrice = Number(product.reseller_price);
  }

  const subtotal = rawPrice;
  let discount = 0;
  let couponCode: string | null = null;

  if (payload.coupon_code?.trim()) {
    const coupon = await validateCoupon(payload.coupon_code, subtotal);
    if (!coupon.valid) {
      return { success: false, message: coupon.message };
    }
    discount = coupon.discount_amount;
    couponCode = coupon.code;
  }

  let pointsUsed = 0;
  const ptsReq = Math.floor(Number(payload.points_to_use ?? 0));
  if (ptsReq > 0) {
    const { data: balRow } = await supabase
      .from('point_balances')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    const available = Number(balRow?.balance ?? 0);
    const maxBySub = Math.floor((subtotal - discount) * 10);
    pointsUsed = Math.min(ptsReq, available, maxBySub);
    pointsUsed = Math.floor(pointsUsed / 10) * 10;
    if (pointsUsed < 10) {
      pointsUsed = 0;
    } else {
      discount += Math.floor(pointsUsed / 10);
    }
  }

  const total = Math.max(0, subtotal - discount);
  const orderNumber = generateOrderNumber();

  const { data: newOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      game_id: payload.game_id,
      product_id: payload.product_id,
      player_data: payload.player_data,
      subtotal,
      discount: discount || 0,
      total,
      contact_email: payload.contact_email?.trim() || user.email || null,
      contact_phone: payload.contact_phone?.trim() || null,
      coupon_code: couponCode,
      status: 'PENDING_PAYMENT',
    })
    .select('id, order_number, status, total')
    .single();

  if (insertError || !newOrder) {
    return { success: false, message: insertError?.message || 'สร้างออเดอร์ไม่สำเร็จ' };
  }

  if (couponCode) {
    await incrementCouponUsage(couponCode);
  }

  return {
    success: true,
    order: {
      ...newOrder,
      total: Number(newOrder.total),
      discount,
      subtotal,
    },
  };
}
