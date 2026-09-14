import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/get-user';
import { getMyWalletBalance, getMyWalletLedger } from '@/lib/wallet/queries';
import { Wallet } from 'lucide-react';

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
        <h1 className="text-2xl font-bold mb-2">กระเป๋าเงิน</h1>
        <p className="text-sm text-zinc-500 mb-6">
          เครดิตในร้าน (Admin เติมให้ได้) · ใช้จ่ายจากกระเป๋าจะเชื่อมในเฟสถัดไป
        </p>

        <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-6 text-center mb-8">
          <Wallet className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-3xl font-black text-emerald-300">
            ฿{balance.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-1">ยอดคงเหลือ</p>
        </div>

        <h2 className="font-semibold mb-3 text-sm">ประวัติ</h2>
        {ledger.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
            ยังไม่มีรายการ
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
