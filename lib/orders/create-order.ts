import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber } from './order-number';
import type { Order } from '@/types/order';

export type CreateOrderPayload = {
  game_id: string;
  product_id: string;
  player_data: Record<string, string>;
  contact_email?: string;
  contact_phone?: string;
};

export type CreateOrderResult =
  | { success: true; order: Pick<Order, 'id' | 'order_number' | 'status' | 'total'> }
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

  const price = Number(product.price);
  let orderNumber = generateOrderNumber();
  let lastError: string | null = null;

  for (let i = 0; i < 5; i++) {
    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      game_id: payload.game_id,
      product_id: payload.product_id,
      player_data: payload.player_data,
      contact_email: email,
      contact_phone: phone,
      subtotal: price,
      discount: 0,
      fee: 0,
      total: price,
      status: 'PENDING_PAYMENT',
    });

    if (!error) {
      return {
        success: true,
        order: {
          id: '',
          order_number: orderNumber,
          status: 'PENDING_PAYMENT',
          total: price,
        },
      };
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
