import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { getMyWalletBalance, getMyWalletLedger } from '@/lib/wallet/queries';
import { Wallet, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'กระเป๋าเงิน' };
export const dynamic = 'force-dynamic';

export default async function AccountWalletPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/account/wallet');

  const balance = await getMyWalletBalance();
  const ledger = await getMyWalletLedger();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">กระเป๋าเงิน</h1>
        <p className="text-sm text-slate-500 mb-6">
          เครดิตในร้าน (Admin เติมให้ได้) · ใช้จ่ายจากกระเป๋าจะเชื่อมในเฟสถัดไป
        </p>

        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50/80 via-white to-sky-50/30 p-6 sm:p-8 text-center mb-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Wallet className="h-7 w-7" />
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-sky-600">฿</span>
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {balance.toLocaleString()}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2">ยอดเงินคงเหลือในกระเป๋า</p>
        </div>

        <h2 className="font-bold mb-3 text-base text-slate-900">ประวัติ</h2>
        {ledger.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-2xs">
            ยังไม่มีรายการ
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
                  ฿{Number(row.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
