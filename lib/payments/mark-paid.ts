import { createClient } from '@/lib/supabase/server';

export async function adminMarkOrderPaid(orderNumber: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const num = orderNumber.trim().toUpperCase();
  if (!num) return { success: false, message: 'ไม่มีหมายเลขออเดอร์' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_mark_order_paid', {
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

  return { success: true, message: 'ยืนยันชำระเงินแล้ว' };
}
