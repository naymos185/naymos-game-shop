import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const orderId = body.id || body.orderId;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ Order ID' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if this is the head of the queue (FIFO enforcement)
    const { data: queueOrders } = await supabase
      .from('orders')
      .select('id, payment_confirmed_at')
      .in('status', ['QUEUED', 'PAID'])
      .order('payment_confirmed_at', { ascending: true, nullsFirst: false })
      .limit(1);

    if (queueOrders && queueOrders.length > 0 && queueOrders[0].id !== orderId) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาดำเนินการเติมตามลำดับคิวแรกก่อน (ห้ามข้ามคิว)' 
      }, { status: 400 });
    }

    // Try RPC first for atomic row lock
    const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_start_processing_order', {
      p_order_id: orderId,
      p_admin_id: adminUser.id,
    });

    if (!rpcErr && rpcData && typeof rpcData === 'object') {
      if ((rpcData as any).success) {
        return NextResponse.json(rpcData);
      }
      return NextResponse.json(rpcData, { status: 400 });
    }

    // Direct atomic update fallback with optimistic concurrency check
    const now = new Date().toISOString();
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'PROCESSING',
        processing_started_at: now,
        processing_admin_id: adminUser.id,
        updated_at: now,
      })
      .eq('id', orderId)
      .in('status', ['QUEUED', 'PAID'])
      .select('id, order_number, status')
      .maybeSingle();

    if (updateErr || !updated) {
      return NextResponse.json({ 
        success: false, 
        message: 'ออเดอร์นี้ถูกแอดมินท่านอื่นกดเริ่มเติมไปแล้ว หรือไม่ได้อยู่ในคิว' 
      }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: 'เริ่มดำเนินการเติมเรียบร้อยแล้ว',
      order: updated,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}
