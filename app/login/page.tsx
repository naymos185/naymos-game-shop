import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'เข้าสู่ระบบ' };

export default function LoginPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-2">เข้าสู่ระบบ</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          Auth จริงจะพร้อมใน Phase 2 — ตอนนี้เป็นหน้า skeleton
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">อีเมล</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm focus:border-red-500 outline-none"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm focus:border-red-500 outline-none"
              disabled
            />
          </div>
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-red-600/50 py-3 font-semibold text-white cursor-not-allowed"
          >
            เข้าสู่ระบบ (Phase 2)
          </button>
          <p className="text-center text-sm text-zinc-500">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-red-400 hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}
