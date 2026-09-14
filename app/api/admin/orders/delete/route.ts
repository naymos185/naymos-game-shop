import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'ไม่มีสิทธิ์ Admin: ' + (err?.message || '') },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const id = String(body.id ?? '').trim();
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ id ออเดอร์' }, { status: 400 });
    }

    // Service-role client only. Throws a clear error when SUPABASE_SERVICE_ROLE_KEY is missing.
    const supabaseAdmin = createAdminClient();

    // payments.order_id is ON DELETE CASCADE, so deleting the order removes its
    // payments automatically. point_ledger.order_id is ON DELETE SET NULL, so
    // point history is preserved with order_id set to NULL.
    // A hard delete is a real delete: there is NO CANCELLED fallback here.
    const { data: deletedRows, error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      // Server-side log only. Never expose secrets or internal details to the client.
      console.error('[admin/orders/delete] DELETE orders failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            'ลบไม่สำเร็จ: ' + error.message + (error.details ? ' (' + error.details + ')' : ''),
        },
        { status: 400 }
      );
    }

    if (!deletedRows || deletedRows.length === 0) {
      console.error('[admin/orders/delete] No rows deleted for id:', id);
      return NextResponse.json(
        { success: false, message: 'ไม่พบออเดอร์ที่ต้องการลบ (อาจถูกลบไปแล้ว)' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'ลบออเดอร์สำเร็จ' });
  } catch (e: any) {
    console.error('[admin/orders/delete] Unexpected error:', e?.message || e);
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
