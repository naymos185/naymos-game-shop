import Link from 'next/link';
import { User, ShoppingCart, Menu } from 'lucide-react';
import { getProfile } from '@/lib/auth/get-user';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { createClient } from '@/lib/supabase/server';

export async function Header() {
  let profile = null;
  let activeOrderCount = 0;

  try {
    profile = await getProfile();
    if (profile) {
      const supabase = await createClient();
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, player_data, created_at')
        .eq('user_id', profile.id)
        .in('status', ['pending', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SUCCESS']);

      if (orders && orders.length > 0) {
        const now = Date.now();
        const TEN_MINUTES_MS = 10 * 60 * 1000;
        activeOrderCount = orders.filter((o) => {
          // If customer already confirmed receipt, it's moved to history
          const pd = (o.player_data as Record<string, unknown>) || {};
          if (pd.customer_confirmed === true) return false;

          // If pending payment and over 10 min, expired
          const isPending = o.status === 'pending' || o.status === 'PENDING_PAYMENT';
          if (isPending) {
            const diff = now - new Date(o.created_at).getTime();
            if (diff > TEN_MINUTES_MS) return false;
          }
          return true;
        }).length;
      }
    }
  } catch {
    profile = null;
    activeOrderCount = 0;
  }

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
            <Link href="/order-tracking" className="relative hover:text-red-400 transition flex items-center gap-1.5">
              ติดตามออเดอร์
              {activeOrderCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                  {activeOrderCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:border-red-600/50 hover:text-red-400 transition max-w-[140px]"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {profile.full_name || profile.email || 'บัญชี'}
                  </span>
                </Link>
                {(profile.role === 'admin' || profile.role === 'super_admin') && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex rounded-xl bg-red-600/20 border border-red-600/40 px-3 py-2 text-sm text-red-400 hover:bg-red-600/30 transition"
                  >
                    Admin
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:border-red-600/50 hover:text-red-400 transition"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </Link>
            )}

            <Link
              href="/order-tracking"
              className="relative flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 p-2.5 text-white transition"
              aria-label="ออเดอร์"
            >
              <ShoppingCart className="h-4 w-4" />
              {activeOrderCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black">
                  {activeOrderCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="md:hidden flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-300"
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
