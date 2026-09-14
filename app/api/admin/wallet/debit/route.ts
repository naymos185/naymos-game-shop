import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = String(body.user_id ?? '').trim();
    const amount = Number(body.amount);
    const reason = body.reason ? String(body.reason) : 'แอดมินตัดเครดิต';

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'ใส่ user_id และจำนวนเงินที่ต้องการตัดให้ถูกต้อง' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check existing wallet
    const { data: wallet, error: getErr } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (getErr || !wallet) {
      return NextResponse.json({ success: false, message: 'ไม่พบกระเป๋าเงินของผู้ใช้นี้' }, { status: 404 });
    }

    const currentBal = Number(wallet.balance ?? 0);
    if (currentBal < amount) {
      return NextResponse.json(
        { success: false, message: `ยอดเงินคงเหลือไม่พอตัด (คงเหลือ ฿${currentBal.toLocaleString()})` },
        { status: 400 }
      );
    }

    const newBal = currentBal - amount;

    // Update wallet
    const { error: updErr } = await supabase
      .from('wallets')
      .update({ balance: newBal, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updErr) {
      return NextResponse.json({ success: false, message: updErr.message }, { status: 400 });
    }

    // Ledger log
    await supabase.from('wallet_ledger').insert({
      user_id: userId,
      amount: -amount,
      balance_after: newBal,
      reason,
      ref_type: 'admin_debit',
    });

    return NextResponse.json({ success: true, balance: newBal });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'เกิดข้อผิดพลาดในการตัดเงิน' },
      { status: 500 }
    );
  }
}
