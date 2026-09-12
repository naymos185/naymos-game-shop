import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'สมัครสมาชิก' };

export default function RegisterPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-2">สมัครสมาชิก</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          สร้างบัญชีเพื่อเก็บประวัติออเดอร์และคะแนน
        </p>
        <RegisterForm />
        <p className="text-center text-sm text-zinc-500 mt-6">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-red-400 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </CustomerLayout>
  );
}
