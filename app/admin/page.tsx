import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingCart,
  Gamepad2,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/admin/dashboard-stats';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';

export const metadata: Metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

const QUICK_LINKS = [
  { href: '/admin/orders', label: 'จัดการออเดอร์', desc: 'ดูและอัปเดตสถานะ' },
  { href: '/admin/games', label: 'จัดการเกม', desc: 'เพิ่ม/แก้ไขเกม' },
  { href: '/admin/products', label: 'แพ็กเกจ', desc: 'ราคาและต้นทุน' },
  { href: '/admin/providers', label: 'Provider', desc: 'API เติมเกม' },
  { href: '/admin/payments', label: 'การชำระเงิน', desc: 'QR / Webhook' },
  { href: '/admin/settings', label: 'ตั้งค่า', desc: 'ระบบทั่วไป' },
];

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: 'ยอดขายวันนี้',
      value: `฿${stats.salesToday.toLocaleString()}`,
      sub: 'ออเดอร์ที่ชำระ/สำเร็จวันนี้',
      color: 'text-emerald-400',
      icon: TrendingUp,
    },
    {
      label: 'ออเดอร์วันนี้',
      value: String(stats.ordersToday),
      sub: `ทั้งหมด ${stats.ordersTotal} รายการ`,
      color: 'text-blue-400',
      icon: ShoppingCart,
    },
    {
      label: 'สำเร็จ',
      value: String(stats.successCount),
      sub: `${stats.successRate}% ของทั้งหมด`,
      color: 'text-green-400',
      icon: CreditCard,
    },
    {
      label: 'รอดำเนินการ',
      value: String(stats.pendingCount),
      sub: 'รอชำระ / กำลังเติม',
      color: 'text-amber-400',
      icon: AlertCircle,
    },
    {
      label: 'ลูกค้า',
      value: String(stats.customers),
      sub: 'สมาชิกทั้งหมด',
      color: 'text-purple-400',
      icon: Users,
    },
    {
      label: 'เกมที่เปิด',
      value: String(stats.gamesActive),
      sub: 'จากฐานข้อมูล',
      color: 'text-red-400',
      icon: Gamepad2,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          NayMos GameShop Backoffice — ข้อมูลจริงจากฐานข้อมูล
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color} opacity-70`} />
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">ออเดอร์ล่าสุด</h2>
            <Link href="/admin/orders" className="text-xs text-red-400 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500 text-center">ยังไม่มีออเดอร์</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {stats.recentOrders.map((o) => (
                  <li
                    key={o.order_number}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm bg-zinc-950/40"
                  >
                    <div>
                      <p className="font-mono text-xs text-white">{o.order_number}</p>
                      <p className="text-[11px] text-zinc-500">
                        {new Date(o.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-400">฿{o.total.toLocaleString()}</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${orderStatusColor(o.status)}`}
                      >
                        {orderStatusLabel(o.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">ทางลัด</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-red-600/40 transition"
              >
                <p className="font-medium text-sm text-white">{l.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm space-y-2">
        <h2 className="font-semibold mb-2">สถานะระบบ</h2>
        <p className="text-emerald-400">✓ Customer Website + Admin Layout</p>
        <p className="text-emerald-400">✓ Auth + Role (customer / admin)</p>
        <p className="text-emerald-400">✓ Games / Products จากฐานข้อมูล</p>
        <p className="text-emerald-400">✓ Orders + Tracking + ประวัติสมาชิก</p>
        <p className="text-emerald-400">✓ Payment (Mock) + Admin ยืนยันชำระ</p>
        <p className="text-emerald-400">✓ Top-up Provider (Mock)</p>
        <p className="text-amber-400">○ ชำระเงินจริง / API เติมเกมจริง — ยังไม่เชื่อม</p>
      </div>
    </div>
  );
}
