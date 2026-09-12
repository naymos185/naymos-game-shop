import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'บัญชีของฉัน' };

const LINKS = [
  { href: '/account/orders', label: 'ประวัติออเดอร์' },
  { href: '/account/wallet', label: 'กระเป๋าเงิน' },
  { href: '/account/points', label: 'คะแนน' },
  { href: '/account/coupons', label: 'คูปอง' },
  { href: '/account/saved-games', label: 'เกมที่บันทึก' },
];

export default function AccountPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">บัญชีของฉัน</h1>
        <p className="text-zinc-400 text-sm mb-8">Skeleton — Auth จริงใน Phase 2</p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mb-6">
          <p className="text-sm text-zinc-500">ยังไม่ได้เข้าสู่ระบบ</p>
          <Link href="/login" className="inline-block mt-3 text-red-400 hover:underline text-sm">
            เข้าสู่ระบบ →
          </Link>
        </div>
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
