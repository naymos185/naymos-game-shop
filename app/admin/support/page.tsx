import type { Metadata } from 'next';
import { listTicketsAdmin } from '@/lib/support/queries';
import { TicketStatusSelect } from '@/components/admin/TicketStatusSelect';

export const metadata: Metadata = { title: 'ซัพพอร์ต' };
export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const tickets = await listTicketsAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Support</h1>
        <p className="text-sm text-zinc-500">{tickets.length} ตั๋ว</p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีตั๋ว — รัน 014_support.sql · ลูกค้าส่งได้ที่ /support
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white text-sm">{t.subject}</p>
                <TicketStatusSelect id={t.id} status={t.status} />
              </div>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap">{t.message}</p>
              <p className="text-[11px] text-zinc-600">
                {t.email || '—'} · {new Date(t.created_at).toLocaleString('th-TH')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
