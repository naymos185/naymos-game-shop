import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { getMyPointBalance, getMyPointLedger } from '@/lib/points/queries';
import { Star } from 'lucide-react';

export const metadata: Metadata = { title: 'คะแนนของฉัน' };
export const dynamic = 'force-dynamic';

export default async function AccountPointsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/points');

  const balance = await getMyPointBalance();
  const ledger = await getMyPointLedger();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">คะแนนของฉัน</h1>
        <p className="text-sm text-zinc-500 mb-6">
          ได้ 1 คะแนน ทุก 10 บาท เมื่อออเดอร์สำเร็จ (สมาชิกเท่านั้น)
        </p>

        <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-6 text-center mb-8">
          <Star className="h-8 w-8 text-amber-400 mx-auto mb-2" />
          <p className="text-3xl font-black text-amber-300">{balance.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1">คะแนนคงเหลือ</p>
        </div>

        <h2 className="font-semibold mb-3 text-sm">ประวัติคะแนน</h2>
        {ledger.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
            ยังไม่มีประวัติ — สั่งซื้อแล้วรอออเดอร์สำเร็จ
            <div className="mt-3">
              <Link href="/games" className="text-red-400 hover:underline">
                ไปเติมเกม →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
            {ledger.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between px-4 py-3 bg-zinc-950/50 text-sm"
              >
                <div>
                  <p className="text-zinc-200">{row.reason}</p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(row.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    row.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {row.amount >= 0 ? '+' : ''}
                  {row.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
