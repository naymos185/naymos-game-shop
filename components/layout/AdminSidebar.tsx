'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Gamepad2,
  Package,
  Server,
  CreditCard,
  Users,
  Ticket,
  Megaphone,
  Image,
  Coins,
  Wallet,
  BarChart3,
  Headphones,
  Settings,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/games', label: 'Games', icon: Gamepad2 },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/providers', label: 'Providers', icon: Server },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/points', label: 'Points', icon: Coins },
  { href: '/admin/wallet', label: 'Wallet', icon: Wallet },
  { href: '/admin/finance', label: 'Finance', icon: BarChart3 },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/support', label: 'Support', icon: Headphones },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-sky-100 bg-white hidden lg:flex flex-col shadow-xs">
      <div className="p-4 border-b border-sky-100">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-sky-500/20">
            N
          </div>
          <span className="font-bold text-base text-slate-800 tracking-tight">
            <span className="text-sky-500">Admin</span> Panel
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-sky-50 text-sky-600 border border-sky-200/80 shadow-xs'
                  : 'text-slate-600 hover:bg-sky-50/50 hover:text-sky-600'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sky-100">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
        >
          ← กลับหน้าร้าน
        </Link>
      </div>
    </aside>
  );
}
