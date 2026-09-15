'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Gift } from 'lucide-react';

interface HeaderNavProps {
  activeOrderCount?: number;
}

export function HeaderNav({ activeOrderCount = 0 }: HeaderNavProps) {
  const pathname = usePathname() || '';

  const isHomeActive = pathname === '/';
  const isGamesActive =
    pathname === '/games' || pathname.startsWith('/games/');
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
      href: '/',
      label: 'หน้าหลัก',
      icon: Home,
      isActive: isHomeActive,
    },
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
            className={}
          >
            {Icon && (
              <Icon
                className={}
              />
            )}
            <span>{item.label}</span>
            {typeof item.badge === 'number' && item.badge > 0 && (
              <span
                className={}
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
