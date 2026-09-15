import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'เข้าสู่ระบบ | NayMos GameShop' };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next ?? '/account';

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="group mb-4">
            <div className="relative w-24 h-24 rounded-3xl bg-white border-2 border-sky-200 p-1.5 shadow-md shadow-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logo.png"
                alt="NayMos GameShop Logo"
                width={90}
                height={90}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-sky-950 text-center tracking-tight mb-1.5">
            เข้าสู่ระบบ
          </h1>
          <p className="text-sm font-medium text-slate-500 text-center">
            เข้าสู่บัญชี <span className="font-bold text-sky-600">NayMos GameShop</span>
          </p>
        </div>

        <LoginForm next={next} />

        <p className="text-center text-sm font-medium text-slate-600 mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="font-bold text-sky-600 hover:text-sky-700 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </CustomerLayout>
  );
}
