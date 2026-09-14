import { createClient } from '@/lib/supabase/server';
import { providerManager } from '@/lib/providers/provider-manager';
import { awardPointsForOrder } from '@/lib/points/queries';
import { notifyUser } from '@/lib/notifications/queries';

export type ProcessTopupResult = {
  success: boolean;
  message: string;
  order_status?: string;
  transaction_id?: string;
};

export async function processTopupForOrder(
  orderNumber: string
): Promise<ProcessTopupResult> {
  const num = orderNumber.trim().toUpperCase();
  if (!num) return { success: false, message: 'ไม่มีหมายเลขออเดอร์' };

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      'id, order_number, status, product_id, player_data, total, provider_transaction_id, user_id'
    )
    .eq('order_number', num)
    .maybeSingle();

  if (orderError || !order) {
    return {
      success: false,
      message: orderError?.message ?? 'ไม่พบออเดอร์ หรือไม่มีสิทธิ์อ่าน',
    };
  }

  if (order.status === 'SUCCESS') {
    return {
      success: true,
      message: 'ออเดอร์นี้เติมสำเร็จแล้ว',
      order_status: 'SUCCESS',
      transaction_id: order.provider_transaction_id ?? undefined,
    };
  }

  if (
    order.status !== 'PAID' &&
    order.status !== 'PROCESSING' &&
    order.status !== 'FAILED'
  ) {
    return {
      success: false,
      message: `สถานะออเดอร์ต้องเป็น PAID ก่อน (ตอนนี้: ${order.status})`,
      order_status: order.status,
    };
  }

  await supabase
    .from('orders')
    .update({ status: 'PROCESSING', updated_at: new Date().toISOString() })
    .eq('id', order.id);

  const provider = providerManager.getDefault();
  const playerData = (order.player_data ?? {}) as Record<string, string | number>;

  let result;
  try {
    result = await provider.createTopup({
      productId: order.product_id,
      playerData,
      orderId: order.id,
      amount: Number(order.total),
    });
  } catch (e) {
    await supabase
      .from('orders')
      .update({
        status: 'FAILED',
        notes: e instanceof Error ? e.message : 'Provider error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);
    return {
      success: false,
      message: e instanceof Error ? e.message : 'เรียก Provider ไม่สำเร็จ',
      order_status: 'FAILED',
    };
  }

  if (result.success && result.status === 'SUCCESS') {
    await supabase
      .from('orders')
      .update({
        status: 'SUCCESS',
        provider_transaction_id: result.transaction_id ?? null,
        notes: result.message ?? 'เติมสำเร็จ',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (order.user_id) {
      try {
        await awardPointsForOrder(order.id);
      } catch {
        /* best-effort */
      }
      try {
        await notifyUser(
          order.user_id,
          'ออเดอร์สำเร็จ',
          `ออเดอร์ ${order.order_number} เติมเกมสำเร็จแล้ว`,
          `/order-tracking?number=${order.order_number}`,
          'success'
        );
      } catch {
        /* best-effort */
      }
    }

    return {
      success: true,
      message: result.message ?? 'เติมเกมสำเร็จ',
      order_status: 'SUCCESS',
      transaction_id: result.transaction_id,
    };
  }

  await supabase
    .from('orders')
    .update({
      status: 'FAILED',
      provider_transaction_id: result.transaction_id ?? null,
      notes: result.message ?? 'เติมไม่สำเร็จ',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  return {
    success: false,
    message: result.message ?? 'เติมเกมไม่สำเร็จ',
    order_status: 'FAILED',
    transaction_id: result.transaction_id,
  };
}
