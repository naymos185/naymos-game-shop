import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderTrackingForm } from '@/components/customer/OrderTrackingForm';

export const metadata: Metadata = { title: 'ติดตามออเดอร์' };

export default function OrderTrackingPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-2">ติดตามออเดอร์</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          กรอกหมายเลขออเดอร์เพื่อตรวจสอบสถานะ
        </p>
        <Suspense fallback={<p className="text-center text-zinc-500 text-sm">กำลังโหลด...</p>}>
          <OrderTrackingForm />
        </Suspense>
      </div>
    </CustomerLayout>
  );
}
