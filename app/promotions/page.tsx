import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'โปรโมชั่น' };

export default function PromotionsPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">โปรโมชั่น</h1>
        <p className="text-zinc-400 mb-8">ดีลพิเศษจาก NayMos GameShop</p>
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center">
          <p className="text-zinc-400 mb-4">ยังไม่มีโปรโมชั่นในขณะนี้</p>
          <p className="text-sm text-zinc-500 mb-6">Admin สามารถสร้างโปรจากหลังบ้านได้ใน Phase 8</p>
          <Link href="/games" className="text-red-400 hover:underline text-sm">
            ไปเลือกเกมเติมเลย →
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
