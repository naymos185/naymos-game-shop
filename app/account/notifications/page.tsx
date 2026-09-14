import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { listMyNotifications } from '@/lib/notifications/queries';
import { Bell } from 'lucide-react';

export const metadata: Metadata = { title: 'การแจ้งเตือน' };
export const dynamic = 'force-dynamic';

export default async function AccountNotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/notifications');

  const items = await listMyNotifications();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Bell className="h-6 w-6 text-red-400" />
          การแจ้งเตือน
        </h1>
        <p className="text-sm text-zinc-500 mb-6">สถานะออเดอร์และการอัปเดตในระบบ</p>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
            ยังไม่มีการแจ้งเตือน
            <div className="mt-3">
              <Link href="/games" className="text-red-400 hover:underline">
                ไปเติมเกม →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl border px-4 py-3 ${
                  n.is_read
                    ? 'border-zinc-800 bg-zinc-950/40'
                    : 'border-red-900/40 bg-red-950/10'
                }`}
              >
                <p className="text-sm font-medium text-white">{n.title}</p>
                {n.body && <p className="text-xs text-zinc-400 mt-1">{n.body}</p>}
                <p className="text-[11px] text-zinc-600 mt-2">
                  {new Date(n.created_at).toLocaleString('th-TH')}
                </p>
                {n.link && (
                  <Link href={n.link} className="text-xs text-red-400 hover:underline mt-1 inline-block">
                    ดูรายละเอียด →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
