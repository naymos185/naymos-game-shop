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
  /** points to redeem: 10 pts = 1 THB */
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
  const email = payload.contact_email?.trim() || null;
  const phone = payload.contact_phone?.trim() || null;

  if (!payload.game_id || !payload.product_id) {
    return { success: false, message: 'ข้อมูลเกมหรือแพ็กเกจไม่ครบ' };
  }

  if (
    payload.game_id.startsWith('mock-') ||
    payload.product_id.startsWith('ff-') ||
    payload.product_id.startsWith('rov-') ||
    payload.product_id.startsWith('ml-') ||
    payload.product_id.startsWith('val-') ||
    payload.product_id.startsWith('gi-') ||
    payload.product_id.startsWith('pubg-')
  ) {
    return {
      success: false,
      message: 'ยังไม่ได้ seed ข้อมูลเกมในฐานข้อมูล — รัน 003_games_seed.sql ก่อน',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, game_id, price, name, is_active')
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

  const subtotal = Number(product.price);
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
    if (!user) {
      return { success: false, message: 'ต้องล็อกอินเพื่อใช้คะแนน' };
    }
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

  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  let orderNumber = generateOrderNumber();
  let lastError: string | null = null;

  async function redeemIfNeeded() {
    if (pointsUsed > 0 && user) {
      try {
        const { data: ord } = await supabase
          .from('orders')
          .select('id')
          .eq('order_number', orderNumber)
          .maybeSingle();
        await supabase.rpc('redeem_points_for_order', {
          p_user_id: user.id,
          p_points: pointsUsed,
          p_order_id: ord?.id ?? null,
        });
      } catch {
        /* best-effort */
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    const row: Record<string, unknown> = {
      order_number: orderNumber,
      user_id: user?.id ?? null,
      game_id: payload.game_id,
      product_id: payload.product_id,
      player_data: payload.player_data,
      contact_email: email,
      contact_phone: phone,
      subtotal,
      discount,
      fee: 0,
      total,
      status: 'PENDING_PAYMENT',
    };
    if (couponCode) row.coupon_code = couponCode;

    const { error } = await supabase.from('orders').insert(row);

    if (!error) {
      if (couponCode) {
        try {
          await incrementCouponUsage(couponCode);
        } catch {
          /* best-effort */
        }
      }
      await redeemIfNeeded();
      return {
        success: true,
        order: {
          id: '',
          order_number: orderNumber,
          status: 'PENDING_PAYMENT',
          total,
          discount,
          subtotal,
        },
      };
    }

    if (error.message?.includes('coupon_code') && couponCode) {
      delete row.coupon_code;
      const { error: e2 } = await supabase.from('orders').insert(row);
      if (!e2) {
        try {
          await incrementCouponUsage(couponCode);
        } catch {
          /* ignore */
        }
        await redeemIfNeeded();
        return {
          success: true,
          order: {
            id: '',
            order_number: orderNumber,
            status: 'PENDING_PAYMENT',
            total,
            discount,
            subtotal,
          },
        };
      }
      lastError = e2.message;
      break;
    }

    if (error.code === '23505') {
      orderNumber = generateOrderNumber();
      lastError = error.message;
      continue;
    }

    lastError = error.message;
    break;
  }

  return { success: false, message: lastError ?? 'สร้างออเดอร์ไม่สำเร็จ' };
}
