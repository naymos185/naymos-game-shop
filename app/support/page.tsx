import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { SupportForm } from '@/components/customer/SupportForm';
import { getSessionUser } from '@/lib/auth/get-user';

export const metadata: Metadata = { title: 'ติดต่อซัพพอร์ต' };
export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const user = await getSessionUser();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">ติดต่อซัพพอร์ต</h1>
        <p className="text-sm text-zinc-500 mb-6">
          มีปัญหาออเดอร์หรือการเติมเกม แจ้งได้ที่นี่
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <SupportForm defaultEmail={user?.email} />
        </div>
      </div>
    </CustomerLayout>
  );
}
