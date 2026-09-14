import type { Metadata } from 'next';
import { listWalletsAdmin } from '@/lib/wallet/queries';
import { WalletCreditForm } from '@/components/admin/WalletCreditForm';

export const metadata: Metadata = { title: 'กระเป๋าเงินสมาชิก' };
export const dynamic = 'force-dynamic';

export default async function AdminWalletPage() {
  const rows = await listWalletsAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Wallet</h1>
        <p className="text-sm text-zinc-500">
          เครดิตสมาชิก · {rows.length} บัญชี · คัดลอก User ID จาก Customers
        </p>
      </div>

      <WalletCreditForm />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีกระเป๋า — รัน 013_wallet.sql แล้วเติมเครดิตด้านบน
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">สมาชิก</th>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">User ID</th>
                <th className="px-4 py-3 font-medium">ยอด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.user_id} className="bg-zinc-950/50">
                  <td className="px-4 py-3 text-white">{r.full_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{r.email || '—'}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">
                    {r.user_id}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-400">
                    ฿{r.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
