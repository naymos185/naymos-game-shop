import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingCart,
  Gamepad2,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/admin/dashboard-stats';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';

export const metadata: Metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

const QUICK_LINKS = [
  { href: '/admin/orders', label: 'จัดการออเดอร์', desc: 'ดูและอัปเดตสถานะ' },
  { href: '/admin/games', label: 'จัดการเกม', desc: 'เพิ่ม/แก้ไขเกม' },
  { href: '/admin/products', label: 'แพ็กเกจ', desc: 'ราคาและต้นทุน' },
  { href: '/admin/customers', label: 'สมาชิกระบบ', desc: 'ปรับยศตัวแทน/ลูกค้า' },
  { href: '/admin/wallet', label: 'กระเป๋าเงิน', desc: 'เติม/ตัดเครดิต' },
  { href: '/admin/settings', label: 'ตั้งค่า', desc: 'ระบบทั่วไป' },
];

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const primaryCards = [
    {
      label: 'ยอดขายวันนี้',
      value: `฿${stats.salesToday.toLocaleString()}`,
      sub: 'ยอดชำระวันนี้',
      color: 'text-emerald-400',
      icon: TrendingUp,
    },
    {
      label: 'กำไรวันนี้',
      value: `฿${stats.profitToday.toLocaleString()}`,
      sub: 'หักต้นทุนสินค้าแล้ว',
      color: 'text-teal-400',
      icon: DollarSign,
    },
    {
      label: 'ออเดอร์วันนี้',
      value: String(stats.ordersToday),
      sub: `ทั้งหมด ${stats.ordersTotal} รายการ`,
      color: 'text-blue-400',
      icon: ShoppingCart,
    },
    {
      label: 'รอดำเนินการ',
      value: String(stats.pendingCount),
      sub: 'รอชำระ / กำลังเติม',
      color: 'text-amber-400',
      icon: AlertCircle,
    },
  ];

  const roleCards = [
    {
      label: 'ลูกค้าทั่วไป',
      value: `${stats.customerCount} คน`,
      sub: 'สมาชิกซื้อปลีก',
      color: 'text-sky-400',
      icon: Users,
    },
    {
      label: 'ตัวแทนจำหน่าย',
      value: `${stats.resellerCount} คน`,
      sub: 'สมาชิกราคาส่ง',
      color: 'text-emerald-400',
      icon: Briefcase,
    },
    {
      label: 'ผู้ดูแลระบบ',
      value: `${stats.adminCount} คน`,
      sub: 'Admin / Super Admin',
      color: 'text-sky-600',
      icon: ShieldCheck,
    },
    {
      label: 'เกมที่เปิด',
      value: `${stats.gamesActive} เกม`,
      sub: 'พร้อมให้บริการ',
      color: 'text-violet-400',
      icon: Gamepad2,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          NayMos GameShop Backoffice — สถิติและข้อมูลเรียลไทม์
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ภาพรวมวันนี้</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {primaryCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color} opacity-70`} />
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-zinc-600 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">โครงสร้างสมาชิก & บริการ</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {roleCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color} opacity-70`} />
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-zinc-600 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">ออเดอร์ล่าสุด</h2>
            <Link href="/admin/orders" className="text-xs text-sky-600 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="rounded-xl border border-sky-100 overflow-hidden">
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">ยังไม่มีออเดอร์</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {stats.recentOrders.map((o) => (
                  <li
                    key={o.order_number}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm bg-slate-50/40"
                  >
                    <div>
                      <p className="font-mono text-xs text-white">{o.order_number}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(o.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sky-600">฿{o.total.toLocaleString()}</p>
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
          <h2 className="font-semibold mb-3">ทางลัดจัดการ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs hover:border-red-600/40 transition"
              >
                <p className="font-medium text-sm text-white">{l.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
