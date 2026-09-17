import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber } from './order-number';
import type { Order } from '@/types/order';
import {
  validateCoupon,
  incrementCouponUsage,
} from '@/lib/coupons/validate';

export type OrderItemInput = {
  product_id: string;
  quantity: number;
};

export type CreateOrderPayload = {
  game_id: string;
  product_id?: string;
  items?: OrderItemInput[];
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
        items?: any[];
      };
    }
  | { success: false; message: string };

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResult> {
  // Normalize items: support both multi-item and legacy single product_id
  let itemsToProcess: OrderItemInput[] = [];
  if (Array.isArray(payload.items) && payload.items.length > 0) {
    itemsToProcess = payload.items.filter(i => i.product_id && Number(i.quantity) > 0);
  } else if (payload.product_id) {
    itemsToProcess = [{ product_id: payload.product_id, quantity: 1 }];
  }

  if (!payload.game_id || itemsToProcess.length === 0) {
    return { success: false, message: 'ข้อมูลเกมหรือแพ็กเกจไม่ถูกต้อง กรุณาเลือกอย่างน้อย 1 รายการ' };
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

  // Fetch all requested products from DB to strictly verify server-side
  const productIds = itemsToProcess.map(i => i.product_id);
  const { data: dbProducts, error: productError } = await supabase
    .from('products')
    .select('id, game_id, price, reseller_price, name, amount, is_active')
    .in('id', productIds);

  if (productError || !dbProducts || dbProducts.length === 0) {
    return { success: false, message: 'ไม่พบแพ็กเกจที่เลือกในระบบ' };
  }

  const productMap = new Map(dbProducts.map(p => [p.id, p]));

  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const item of itemsToProcess) {
    const prod = productMap.get(item.product_id);
    if (!prod) {
      return { success: false, message: `ไม่พบแพ็กเกจไอดี ${item.product_id}` };
    }
    if (!prod.is_active) {
      return { success: false, message: `แพ็กเกจ "${prod.name}" ปิดใช้งานชั่วคราว` };
    }
    if (prod.game_id !== payload.game_id) {
      return { success: false, message: `แพ็กเกจ "${prod.name}" ไม่ตรงกับเกมที่เลือก` };
    }

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    let unitPrice = Number(prod.price || 0);
    if (isReseller && prod.reseller_price != null && Number(prod.reseller_price) > 0) {
      unitPrice = Number(prod.reseller_price);
    }

    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    verifiedItems.push({
      product_id: prod.id,
      name: prod.name,
      amount: prod.amount,
      quantity: qty,
      unit_price: unitPrice,
      subtotal: lineTotal,
    });
  }

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

  // Primary product_id is the first product
  const primaryProductId = itemsToProcess[0].product_id;

  // Store detailed item breakdown in player_data._items for full fidelity
  const enrichedPlayerData = {
    ...payload.player_data,
    _order_items: verifiedItems,
    _total_packages_count: verifiedItems.reduce((acc, i) => acc + i.quantity, 0),
  };

  const { data: newOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      game_id: payload.game_id,
      product_id: primaryProductId,
      player_data: enrichedPlayerData,
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
      items: verifiedItems,
    },
  };
}
