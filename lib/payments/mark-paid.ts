import { createClient } from '@/lib/supabase/server';
import { processTopupForOrder } from '@/lib/orders/process-topup';

export async function adminMarkOrderPaid(orderNumber: string): Promise<{
  success: boolean;
  message?: string;
  topup?: { success: boolean; message: string; order_status?: string };
}> {
  const num = orderNumber.trim().toUpperCase();
  if (!num) return { success: false, message: 'ไม่มีหมายเลขออเดอร์' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_mark_order_paid', {
    p_order_number: num,
  });

  if (error) {
    if (error.message.includes('UNAUTHORIZED')) {
      return { success: false, message: 'ไม่มีสิทธิ์ Admin' };
    }
    if (error.message.includes('ORDER_NOT_FOUND')) {
      return { success: false, message: 'ไม่พบออเดอร์' };
    }
    return { success: false, message: error.message };
  }

  const topup = await processTopupForOrder(num);

  return {
    success: true,
    message: topup.success
      ? `ยืนยันชำระแล้ว · ${topup.message}`
      : `ยืนยันชำระแล้ว แต่เติมเกมยังไม่สำเร็จ: ${topup.message}`,
    topup,
  };
}
