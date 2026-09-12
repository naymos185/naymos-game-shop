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

export const metadata: Metadata = { title: 'Admin Dashboard' };

const STATS = [
  { label: 'ยอดขายวันนี้', value: '฿0', sub: 'Phase 2+ จะมีข้อมูลจริง', color: 'text-emerald-400', icon: TrendingUp },
  { label: 'ออเดอร์วันนี้', value: '0', sub: 'ทั้งหมด 0 รายการ', color: 'text-blue-400', icon: ShoppingCart },
  { label: 'สำเร็จ', value: '0', sub: '0%', color: 'text-green-400', icon: CreditCard },
  { label: 'รอดำเนินการ', value: '0', sub: 'ต้องตรวจสอบ', color: 'text-amber-400', icon: AlertCircle },
  { label: 'ลูกค้า', value: '0', sub: 'สมาชิกทั้งหมด', color: 'text-purple-400', icon: Users },
  { label: 'เกมที่เปิด', value: '6', sub: 'จาก mock data', color: 'text-red-400', icon: Gamepad2 },
];

const QUICK_LINKS = [
  { href: '/admin/orders', label: 'จัดการออเดอร์', desc: 'ดูและอัปเดตสถานะ' },
  { href: '/admin/games', label: 'จัดการเกม', desc: 'เพิ่ม/แก้ไขเกม' },
  { href: '/admin/products', label: 'แพ็กเกจ', desc: 'ราคาและต้นทุน' },
  { href: '/admin/providers', label: 'Provider', desc: 'API เติมเกม' },
  { href: '/admin/payments', label: 'การชำระเงิน', desc: 'QR / Webhook' },
  { href: '/admin/settings', label: 'ตั้งค่า', desc: 'ระบบทั่วไป' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">NayMos GameShop Backoffice — Phase 1</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATS.map((s) => (
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

      <div>
        <h2 className="font-semibold mb-3">ทางลัด</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-red-600/40 transition"
            >
              <p className="font-medium text-sm">{l.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-semibold mb-2">สถานะระบบ</h2>
        <ul className="text-sm text-zinc-400 space-y-1.5">
          <li>✅ Customer Website + Admin Layout พร้อม</li>
          <li>✅ Provider / Payment Architecture (Mock)</li>
          <li>✅ Database migration foundation</li>
          <li>⏳ Auth + Role protection — Phase 2</li>
          <li>⏳ Order / Payment จริง — Phase 4–6</li>
          <li>⏳ Auto top-up — Phase 7</li>
        </ul>
      </div>
    </div>
  );
}
