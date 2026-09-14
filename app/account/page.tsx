import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfile } from '@/lib/auth/get-user';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'บัญชีของฉัน' };

const LINKS = [
  { href: '/account/orders', label: 'ประวัติออเดอร์' },
  { href: '/account/wallet', label: 'กระเป๋าเงิน' },
  { href: '/account/points', label: 'คะแนน' },
  { href: '/account/notifications', label: 'การแจ้งเตือน' },
  { href: '/account/coupons', label: 'คูปอง' },
  { href: '/account/saved-games', label: 'เกมที่บันทึก' },
];

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login?next=/account');
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">บัญชีของฉัน</h1>
        <p className="text-zinc-400 text-sm mb-8">จัดการข้อมูลและประวัติของคุณ</p>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mb-6 space-y-3">
          <p className="text-sm">
            <span className="text-zinc-500">ชื่อ:</span>{' '}
            <span className="text-white font-medium">{profile.full_name || '—'}</span>
          </p>
          <p className="text-sm">
            <span className="text-zinc-500">อีเมล:</span>{' '}
            <span className="text-white font-medium">{profile.email || '—'}</span>
          </p>
          <div className="text-sm flex items-center gap-2">
            <span className="text-zinc-500">สถานะ:</span>
            {profile.role === 'reseller' ? (
              <span className="inline-flex items-center rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                ตัวแทนจำหน่าย (ราคาส่ง)
              </span>
            ) : profile.role === 'admin' || profile.role === 'super_admin' ? (
              <span className="inline-flex items-center rounded-lg bg-red-500/15 border border-red-500/40 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                ผู้ดูแลระบบ ({profile.role})
              </span>
            ) : (
              <span className="text-zinc-300 text-xs font-medium">ลูกค้าทั่วไป</span>
            )}
          </div>
          <div className="pt-3">
            <LogoutButton />
          </div>
        </div>

        {(profile.role === 'admin' || profile.role === 'super_admin') && (
          <Link
            href="/admin"
            className="block mb-6 rounded-xl border border-red-600/40 bg-red-600/10 px-4 py-3 text-sm text-red-400 hover:bg-red-600/20 transition"
          >
            ไปหลังบ้าน Admin →
          </Link>
        )}

        <div className="space-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm hover:border-red-600/40 transition"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
