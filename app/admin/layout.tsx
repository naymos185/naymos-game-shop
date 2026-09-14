import { AdminLayout } from '@/components/layout/AdminLayout';
import { requireAdmin } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/');
  }
  return <AdminLayout>{children}</AdminLayout>;
}
