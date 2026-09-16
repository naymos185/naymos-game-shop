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
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/games', label: 'Games', icon: Gamepad2 },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
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
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-slate-50 hidden lg:flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <span className="font-bold text-sm">
            <span className="text-blue-600">Admin</span> Panel
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
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
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition"
        >
          ← กลับหน้าร้าน
        </Link>
      </div>
    </aside>
  );
}
