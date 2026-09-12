import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'สมัครสมาชิก' };

export default function RegisterPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-2">สมัครสมาชิก</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          Auth จริงจะพร้อมใน Phase 2 — ตอนนี้เป็นหน้า skeleton
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">ชื่อ</label>
            <input type="text" placeholder="ชื่อของคุณ" disabled className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">อีเมล</label>
            <input type="email" placeholder="you@example.com" disabled className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">รหัสผ่าน</label>
            <input type="password" placeholder="••••••••" disabled className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none" />
          </div>
          <button type="button" disabled className="w-full rounded-xl bg-red-600/50 py-3 font-semibold text-white cursor-not-allowed">
            สมัครสมาชิก (Phase 2)
          </button>
          <p className="text-center text-sm text-zinc-500">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-red-400 hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}
