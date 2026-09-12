import Link from 'next/link';
import { Search, User, ShoppingCart, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🎮</span>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-red-500">NayMos</span>
              <span className="text-white"> GameShop</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
            <Link href="/games" className="hover:text-red-400 transition">เกมทั้งหมด</Link>
            <Link href="/promotions" className="hover:text-red-400 transition">โปรโมชั่น</Link>
            <Link href="/how-to" className="hover:text-red-400 transition">วิธีเติม</Link>
            <Link href="/faq" className="hover:text-red-400 transition">FAQ</Link>
            <Link href="/order-tracking" className="hover:text-red-400 transition">ติดตามออเดอร์</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:border-red-600/50 hover:text-red-400 transition">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </Link>
            <Link href="/order-tracking" className="flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 p-2.5 text-white transition" aria-label="ออเดอร์">
              <ShoppingCart className="h-4 w-4" />
            </Link>
            <button type="button" className="md:hidden flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-300" aria-label="เมนู">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
