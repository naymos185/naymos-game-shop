import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'ติดตามออเดอร์' };

export default function OrderTrackingPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-2">ติดตามออเดอร์</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          กรอกหมายเลขออเดอร์เพื่อดูสถานะ (ระบบจริง Phase 4+)
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">หมายเลขออเดอร์</label>
            <input
              type="text"
              placeholder="NM-20260912-XXXX"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm focus:border-red-500 outline-none"
            />
          </div>
          <button type="button" className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3 font-semibold text-white transition">
            ตรวจสอบสถานะ
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}
