import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/get-user';
import { getStoreSettings, saveStoreSettings } from '@/lib/admin/settings';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์' }, { status: 403 });
  }
  const settings = await getStoreSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ Admin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await saveStoreSettings({
      name: String(body.name ?? 'NayMos GameShop').trim() || 'NayMos GameShop',
      promptpay_id: String(body.promptpay_id ?? '').trim(),
      bank_name: String(body.bank_name ?? 'พร้อมเพย์').trim(),
      account_name: String(body.account_name ?? '').trim(),
    });
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : 'ผิดพลาด' },
      { status: 500 }
    );
  }
}
