import { createClient } from '@/lib/supabase/server';
import { paymentManager } from './payment-manager';
import { getStoreSettings } from '@/lib/admin/settings';

export type EnsurePaymentResult =
  | {
      success: true;
      order_number: string;
      order_status: string;
      amount: number;
      payment_status: string;
      payment_reference: string | null;
      qr_data: string | null;
      expires_at: string | null;
      game_name?: string;
      product_name?: string;
    }
  | { success: false; message: string };

export async function ensurePaymentForOrder(
  orderNumber: string
): Promise<EnsurePaymentResult> {
  const num = orderNumber.trim().toUpperCase();
  if (!num) return { success: false, message: 'ไม่มีหมายเลขออเดอร์' };

  const supabase = await createClient();

  const { data: rpcRows } = await supabase.rpc('get_payment_for_order', {
    p_order_number: num,
  });
  const rpc = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

  let orderId: string | null = rpc?.order_id ?? null;
  let orderStatus: string = rpc?.order_status ?? '';
  let amount: number = rpc?.amount != null ? Number(rpc.amount) : 0;
  let gameId: string | null = rpc?.game_id ?? null;
  let productId: string | null = rpc?.product_id ?? null;

  {
    const { data: orderRows } = await supabase.rpc('get_order_by_number', {
      p_order_number: num,
    });
    const order = Array.isArray(orderRows) ? orderRows[0] : orderRows;
    if (!order && !orderId) {
      return { success: false, message: 'ไม่พบออเดอร์' };
    }
    if (order) {
      orderId = orderId ?? order.id;
      orderStatus = orderStatus || order.status;
      const orderTotal = Number(order.total);
      if (!amount || amount === 0) {
        amount = orderTotal;
      }
      gameId = gameId ?? order.game_id;
      productId = productId ?? order.product_id;
    }
  }

  if (!orderId) {
    return { success: false, message: 'ไม่พบออเดอร์' };
  }

  if (rpc?.payment_id) {
    const displayAmount =
      rpc.amount != null && Number(rpc.amount) > 0 ? Number(rpc.amount) : amount;
    const names = await loadNames(supabase, gameId, productId);
    return {
      success: true,
      order_number: num,
      order_status: orderStatus,
      amount: displayAmount,
      payment_status: rpc.payment_status ?? 'PENDING',
      payment_reference: rpc.payment_reference ?? null,
      qr_data: rpc.qr_data ?? null,
      expires_at: rpc.expires_at ?? null,
      ...names,
    };
  }

  if (orderStatus !== 'PENDING_PAYMENT') {
    const names = await loadNames(supabase, gameId, productId);
    return {
      success: true,
      order_number: num,
      order_status: orderStatus,
      amount,
      payment_status:
        orderStatus === 'PAID' || orderStatus === 'SUCCESS' ? 'PAID' : 'PENDING',
      payment_reference: null,
      qr_data: null,
      expires_at: null,
      ...names,
    };
  }

  if (!amount || amount <= 0) {
    return { success: false, message: 'ยอดออเดอร์ไม่ถูกต้อง' };
  }

  const storeSettings = await getStoreSettings();
  const provider = paymentManager.getDefault();
  const created = await provider.createPayment({
    orderId,
    amount,
    orderNumber: num,
    expiresInMinutes: 30,
    promptpayId: storeSettings.promptpay_id,
  });

  const { error } = await supabase.from('payments').insert({
    order_id: orderId,
    provider: created.payment.provider ?? provider.id,
    payment_reference: created.payment.payment_reference,
    amount,
    status: 'PENDING',
    qr_data: created.qrData ?? created.payment.qr_data,
    expires_at: created.payment.expires_at,
  });

  if (error) {
    const { data: again } = await supabase.rpc('get_payment_for_order', {
      p_order_number: num,
    });
    const row = Array.isArray(again) ? again[0] : again;
    if (row?.payment_id) {
      const names = await loadNames(supabase, gameId, productId);
      const rowAmount = Number(row.amount);
      return {
        success: true,
        order_number: num,
        order_status: orderStatus,
        amount: rowAmount > 0 ? rowAmount : amount,
        payment_status: row.payment_status,
        payment_reference: row.payment_reference,
        qr_data: row.qr_data,
        expires_at: row.expires_at,
        ...names,
      };
    }
    return { success: false, message: error.message };
  }

  const names = await loadNames(supabase, gameId, productId);
  return {
    success: true,
    order_number: num,
    order_status: orderStatus,
    amount,
    payment_status: 'PENDING',
    payment_reference: created.payment.payment_reference ?? null,
    qr_data: created.qrData ?? null,
    expires_at: created.payment.expires_at ?? null,
    ...names,
  };
}

async function loadNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gameId: string | null,
  productId: string | null
) {
  let game_name: string | undefined;
  let product_name: string | undefined;
  if (gameId) {
    const { data } = await supabase.from('games').select('name').eq('id', gameId).maybeSingle();
    game_name = data?.name;
  }
  if (productId) {
    const { data } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .maybeSingle();
    product_name = data?.name;
  }
  return { game_name, product_name };
}
