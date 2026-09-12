import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'เข้าสู่ระบบ' };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next ?? '/account';

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-2">เข้าสู่ระบบ</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          เข้าสู่บัญชี NayMos GameShop
        </p>
        <LoginForm next={next} />
        <p className="text-center text-sm text-zinc-500 mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-red-400 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </CustomerLayout>
  );
}
