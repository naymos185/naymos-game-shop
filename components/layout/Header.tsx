import Link from 'next/link';
import { User, ShoppingCart, Menu } from 'lucide-react';
import { getProfile } from '@/lib/auth/get-user';
import { LogoutButton } from '@/components/auth/LogoutButton';

export async function Header() {
  let profile = null;
  try {
    profile = await getProfile();
  } catch {
    profile = null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🎮</span>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-blue-600">NayMos</span>
              <span className="text-slate-800"> GameShop</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/games" className="hover:text-blue-600 transition">
              เกมทั้งหมด
            </Link>
            <Link href="/promotions" className="hover:text-blue-600 transition">
              โปรโมชั่น
            </Link>
            <Link href="/how-to" className="hover:text-blue-600 transition">
              วิธีเติม
            </Link>
            <Link href="/faq" className="hover:text-blue-600 transition">
              FAQ
            </Link>
            <Link href="/order-tracking" className="hover:text-blue-600 transition">
              ติดตามออเดอร์
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition max-w-[140px]"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {profile.full_name || profile.email || 'บัญชี'}
                  </span>
                </Link>
                {(profile.role === 'admin' || profile.role === 'super_admin') && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100 transition"
                  >
                    Admin
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </Link>
            )}

            <Link
              href="/order-tracking"
              className="flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 p-2.5 text-white transition shadow-sm"
              aria-label="ออเดอร์"
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            <button
              type="button"
              className="md:hidden flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-600"
              aria-label="เมนู"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
