import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfile } from '@/lib/auth/get-user';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { redirect } from 'next/navigation';
import {
  Bookmark,
  Bell,
  History,
  Ticket,
  Wallet,
  Star,
} from 'lucide-react';

export const metadata: Metadata = { title: 'บัญชีของฉัน' };

const LINKS = [
  { href: '/account/orders', label: 'ประวัติออเดอร์', desc: 'ดูออเดอร์ที่เคยสั่ง', icon: History },
  { href: '/account/coupons', label: 'คูปอง', desc: 'โค้ดส่วนลดที่ใช้ได้', icon: Ticket },
  { href: '/account/saved-games', label: 'เกมที่บันทึก', desc: 'บัญชีเกมที่บันทึกไว้', icon: Bookmark },
  { href: '/account/wallet', label: 'กระเป๋าเงิน', desc: 'เครดิต Wallet', icon: Wallet },
  { href: '/account/points', label: 'คะแนน', desc: 'คะแนนสะสม / แลก', icon: Star },
  { href: '/account/notifications', label: 'การแจ้งเตือน', desc: 'ข้อความจากระบบ', icon: Bell },
];

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login?next=/account');
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">บัญชีของฉัน</h1>
        <p className="text-slate-500 text-sm mb-8">จัดการข้อมูลและประวัติของคุณ</p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 space-y-2 shadow-sm">
          <p className="text-sm">
            <span className="text-slate-400">ชื่อ:</span>{' '}
            <span className="text-slate-900">{profile.full_name || '—'}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400">อีเมล:</span>{' '}
            <span className="text-slate-900">{profile.email || '—'}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400">บทบาท:</span>{' '}
            <span className="text-blue-600 font-medium">{profile.role}</span>
          </p>
          <div className="pt-3">
            <LogoutButton />
          </div>
        </div>

        {(profile.role === 'admin' || profile.role === 'super_admin') && (
          <Link
            href="/admin"
            className="block mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 hover:bg-blue-100 transition font-medium"
          >
            ไปหลังบ้าน Admin →
          </Link>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm hover:border-blue-300 hover:shadow-sm transition"
              >
                <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{l.label}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{l.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/games"
            className="block text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition"
          >
            ไปเลือกเติมเกม
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
