import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Marks an order as PAID.
 * Source of truth for payment status update only.
 * Topup processing is strictly decoupled and handled via processTopupForOrder.
 */
export async function adminMarkOrderPaid(orderNumber: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const num = orderNumber.trim().toUpperCase();
  if (!num) return { success: false, message: 'ไม่มีหมายเลขออเดอร์' };

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
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

  return {
    success: true,
    message: 'ยืนยันการชำระเงินเรียบร้อยแล้ว',
  };
}
