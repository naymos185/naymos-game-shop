import type { Metadata } from 'next';
import { listCustomersAdmin } from '@/lib/admin/customers';
import { CustomerRoleSelect } from '@/components/admin/CustomerRoleSelect';

export const metadata: Metadata = { title: 'ลูกค้า' };
export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await listCustomersAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Customers</h1>
        <p className="text-sm text-zinc-500">
          สมาชิกจากระบบ · {customers.length} คน · คัดลอก User ID ไปเติม Wallet ได้
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-sm text-zinc-500">
          ยังไม่มีสมาชิก
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ชื่อ</th>
                <th className="px-4 py-3 font-medium">อีเมล</th>
                <th className="px-4 py-3 font-medium">บทบาท</th>
                <th className="px-4 py-3 font-medium">ออเดอร์</th>
                <th className="px-4 py-3 font-medium">User ID</th>
                <th className="px-4 py-3 font-medium">สมัครเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {customers.map((c) => (
                <tr key={c.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-white">{c.full_name || '—'}</td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{c.email || '—'}</td>
                  <td className="px-4 py-3"><CustomerRoleSelect userId={c.id} initialRole={c.role} /></td>
                  <td className="px-4 py-3 text-zinc-300">{c.order_count}</td>
                  <td
                    className="px-4 py-3 font-mono text-[10px] text-zinc-500 max-w-[140px] truncate"
                    title={c.id}
                  >
                    {c.id}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString('th-TH')}
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
