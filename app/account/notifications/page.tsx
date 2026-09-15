import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { listMyNotifications } from '@/lib/notifications/queries';
import { Bell, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'การแจ้งเตือน' };
export const dynamic = 'force-dynamic';

export default async function AccountNotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/notifications');

  const items = await listMyNotifications();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900">
          <Bell className="h-6 w-6 text-sky-500" />
          การแจ้งเตือน
        </h1>
        <p className="text-sm text-slate-500 mb-6">สถานะออเดอร์และการอัปเดตในระบบ</p>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-2xs">
            ยังไม่มีการแจ้งเตือน
            <div className="mt-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold hover:underline"
              >
                <span>ไปเติมเกม</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li
                key={n.id}
                className={`rounded-2xl border px-4 py-3.5 transition shadow-2xs ${
                  n.is_read
                    ? 'border-sky-100 bg-white/90 hover:bg-sky-50/40'
                    : 'border-sky-200 bg-gradient-to-r from-sky-50/90 via-white to-white hover:bg-sky-50/70 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  {!n.is_read && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-sky-500 mt-1.5" />
                  )}
                </div>
                {n.body && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body}</p>}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-sky-50 text-[11px] text-slate-400">
                  <span>{new Date(n.created_at).toLocaleString('th-TH')}</span>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-xs text-sky-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
