import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { PaymentPanel } from '@/components/customer/PaymentPanel';
import Link from 'next/link';

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `ชำระเงิน ${decodeURIComponent(orderNumber)}` };
}

export default async function PayPage({ params }: Props) {
  const { orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber).toUpperCase();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <nav className="text-sm text-zinc-500 mb-6">
          <Link href="/order-tracking" className="hover:text-red-400">
            ติดตามออเดอร์
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">ชำระเงิน</span>
        </nav>
        <h1 className="text-2xl font-bold mb-6 text-center">ชำระเงิน</h1>
        <PaymentPanel orderNumber={decoded} />
      </div>
    </CustomerLayout>
  );
}
