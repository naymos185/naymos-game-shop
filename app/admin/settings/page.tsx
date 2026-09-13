import type { Metadata } from 'next';
import { getStoreSettings } from '@/lib/admin/settings';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';

export const metadata: Metadata = { title: 'ตั้งค่าร้าน' };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-500">ข้อมูลร้านที่แสดงหน้าชำระเงิน</p>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <StoreSettingsForm initial={settings} />
      </div>
    </div>
  );
}
