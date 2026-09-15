import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { getMyPointBalance, getMyPointLedger } from '@/lib/points/queries';
import { Star, ArrowRight } from 'lucide-react';

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
        <h1 className="text-2xl font-bold mb-2 text-slate-900">คะแนนของฉัน</h1>
        <p className="text-sm text-slate-500 mb-6">
          ได้ 1 คะแนน ทุก 10 บาท เมื่อออเดอร์สำเร็จ (สมาชิกเท่านั้น)
        </p>

        <div className="rounded-3xl border border-amber-100 bg-gradient-to-b from-amber-50/70 via-white to-sky-50/30 p-6 sm:p-8 text-center mb-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Star className="h-7 w-7 fill-amber-400 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {balance.toLocaleString()}
            </span>
            <span className="text-lg font-bold text-amber-600">คะแนน</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2">คะแนนสะสมคงเหลือ</p>
        </div>

        <h2 className="font-bold mb-3 text-base text-slate-900">ประวัติคะแนน</h2>
        {ledger.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-2xs">
            ยังไม่มีประวัติ — สั่งซื้อแล้วรอออเดอร์สำเร็จ
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
          <ul className="divide-y divide-sky-100 rounded-2xl border border-sky-100 bg-white overflow-hidden shadow-2xs">
            {ledger.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-sky-50/40 transition"
              >
                <div>
                  <p className="font-medium text-slate-800">{row.reason}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(row.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    row.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {row.amount >= 0 ? '+' : ''}
                  {row.amount} คะแนน
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
