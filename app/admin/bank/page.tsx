import type { Metadata } from 'next';
import { getStoreSettings } from '@/lib/admin/settings';
import { BankSettingsForm } from '@/components/admin/BankSettingsForm';

export const metadata: Metadata = { title: 'จัดการบัญชีธนาคาร & QR Code | Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminBankPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          จัดการบัญชีธนาคาร & QR Code สำหรับรับเงิน
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          กำหนดเลขพร้อมเพย์ ธนาคาร และชื่อบัญชี ที่จะใช้สร้าง QR Code ให้ลูกค้าสแกนชำระเงิน
        </p>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-white p-6 sm:p-8 shadow-sm">
        <BankSettingsForm initial={settings} />
      </div>
    </div>
  );
}
