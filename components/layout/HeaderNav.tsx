'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Gift } from 'lucide-react';

interface HeaderNavProps {
  activeOrderCount?: number;
}

export function HeaderNav({ activeOrderCount = 0 }: HeaderNavProps) {
  const pathname = usePathname() || '';

  const isGamesActive =
    pathname === '/' || pathname === '/games' || pathname.startsWith('/games/');
  const isPromotionsActive =
    pathname === '/promotions' || pathname.startsWith('/promotions/');
  const isHowToActive =
    pathname === '/how-to' || pathname.startsWith('/how-to/');
  const isFaqActive =
    pathname === '/faq' || pathname.startsWith('/faq/');
  const isTrackingActive =
    pathname === '/order-tracking' || pathname.startsWith('/order-tracking/');

  const navItems = [
    {
      href: '/games',
      label: 'เกมทั้งหมด',
      icon: Gamepad2,
      isActive: isGamesActive,
    },
    {
      href: '/promotions',
      label: 'โปรโมชั่น',
      icon: Gift,
      isActive: isPromotionsActive,
    },
    {
      href: '/how-to',
      label: 'วิธีเติมเกม',
      isActive: isHowToActive,
    },
    {
      href: '/faq',
      label: 'คำถามพบบ่อย',
      isActive: isFaqActive,
    },
    {
      href: '/order-tracking',
      label: 'ติดตามออเดอร์',
      isActive: isTrackingActive,
      badge: activeOrderCount,
    },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 select-none ${
              item.isActive
                ? 'bg-sky-500 text-white font-bold shadow-xs shadow-sky-200 ring-2 ring-sky-300/40'
                : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 transition-colors ${
                  item.isActive ? 'text-white' : 'text-sky-500'
                }`}
              />
            )}
            <span>{item.label}</span>
            {typeof item.badge === 'number' && item.badge > 0 && (
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                  item.isActive
                    ? 'bg-white text-sky-600 shadow-2xs'
                    : 'bg-sky-500 text-white animate-bounce'
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
