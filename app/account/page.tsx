import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfile } from '@/lib/auth/get-user';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { ChangePasswordModal } from '@/components/account/ChangePasswordModal';
import { redirect } from 'next/navigation';
import {
  ChevronRight,
  Package,
  Wallet,
  Coins,
  Bell,
  Ticket,
  Bookmark,
} from 'lucide-react';

export const metadata: Metadata = { title: 'บัญชีของฉัน' };

const LINKS = [
  { href: '/account/orders', label: 'ประวัติออเดอร์', icon: Package },
  { href: '/account/wallet', label: 'กระเป๋าเงิน', icon: Wallet },
  { href: '/account/points', label: 'คะแนน', icon: Coins },
  { href: '/account/notifications', label: 'การแจ้งเตือน', icon: Bell },
  { href: '/account/coupons', label: 'คูปอง', icon: Ticket },
  { href: '/account/saved-games', label: 'เกมที่บันทึก', icon: Bookmark },
];

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login?next=/account');
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 text-slate-800">บัญชีของฉัน</h1>
        <p className="text-sky-600/80 text-sm mb-8">จัดการข้อมูลและประวัติของคุณ</p>

        {/* Main Profile Card */}
        <div className="rounded-3xl border border-sky-100 bg-white/95 p-6 mb-6 shadow-sm shadow-sky-100/50 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-sky-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 font-bold text-lg">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{profile.full_name || 'ผู้ใช้งาน'}</h2>
              <p className="text-xs text-slate-500">{profile.email || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-400 block mb-0.5">ชื่อผู้ใช้</span>
              <span className="text-slate-900 font-semibold">{profile.full_name || '—'}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <span className="text-xs text-slate-400 block mb-0.5">อีเมล</span>
              <span className="text-slate-900 font-semibold truncate block">{profile.email || '—'}</span>
            </div>
          </div>

          <div className="text-sm flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">สถานะบัญชี:</span>
              {profile.role === 'reseller' ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ตัวแทนจำหน่าย (ราคาส่ง)
                </span>
              ) : profile.role === 'admin' || profile.role === 'super_admin' ? (
                <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-700">
                  ผู้ดูแลระบบ ({profile.role})
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  ลูกค้าทั่วไป
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Change Password & Logout */}
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-sky-50">
            <ChangePasswordModal email={profile.email || ''} />
            <LogoutButton />
          </div>
        </div>

        {(profile.role === 'admin' || profile.role === 'super_admin') && (
          <Link
            href="/admin"
            className="flex items-center justify-between mb-6 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 px-5 py-3.5 text-sm font-semibold text-sky-700 hover:border-sky-300 hover:shadow-sm transition"
          >
            <span>ไปหลังบ้าน Admin</span>
            <ChevronRight className="h-4 w-4 text-sky-500" />
          </Link>
        )}

        {/* Links List */}
        <div className="space-y-2.5">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white/95 px-5 py-3.5 text-sm font-medium text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{l.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition" />
              </Link>
            );
          })}
        </div>
      </div>
    </CustomerLayout>
  );
}
