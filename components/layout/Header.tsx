import Link from 'next/link';
import Image from 'next/image';
import { User, ShoppingCart, Sparkles, Gamepad2, Gift, HelpCircle } from 'lucide-react';
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
        activeOrderCount = orders.filter((o) => {
          const pd = (o.player_data as Record<string, unknown>) || {};
          return pd.customer_confirmed !== true;
        }).length;
      }
    }
  } catch {
    profile = null;
    activeOrderCount = 0;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo with Mascot */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 p-0.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
              <img
                src="/images/logo.png"
                alt="NayMos GameShop Mascot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-sky-950 flex items-center gap-1">
                NayMos <span className="text-sky-500 font-black">GameShop</span>
                <span className="text-xs">✨</span>
              </span>
              <span className="text-[10px] text-sky-600 font-medium tracking-wide">
                บริการเติมเกมออนไลน์ 100%
              </span>
            </div>
          </Link>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <Link
              href="/games"
              className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 hover:text-sky-600 transition flex items-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4 text-sky-500" />
              เกมทั้งหมด
            </Link>
            <Link
              href="/promotions"
              className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 hover:text-sky-600 transition flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-sky-500" />
              โปรโมชั่น
            </Link>
            <Link
              href="/how-to"
              className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 hover:text-sky-600 transition"
            >
              วิธีเติมเกม
            </Link>
            <Link
              href="/faq"
              className="px-3.5 py-1.5 rounded-full hover:bg-sky-50 hover:text-sky-600 transition"
            >
              คำถามพบบ่อย
            </Link>
            <Link
              href="/order-tracking"
              className="relative px-3.5 py-1.5 rounded-full hover:bg-sky-50 hover:text-sky-600 transition flex items-center gap-1.5"
            >
              ติดตามออเดอร์
              {activeOrderCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-sky-500 rounded-full animate-bounce">
                  {activeOrderCount}
                </span>
              )}
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-sky-900 hover:bg-sky-100 hover:border-sky-300 transition max-w-[150px] shadow-xs"
                >
                  <User className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {profile.full_name || profile.email || 'บัญชีของฉัน'}
                  </span>
                </Link>
                {(profile.role === 'admin' || profile.role === 'super_admin') && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs"
                  >
                    หลังบ้าน Admin
                  </Link>
                )}
                {profile.role === 'reseller' && (
                  <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                    🏷️ ตัวแทนจำหน่าย
                  </span>
                )}
                <LogoutButton />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-full bg-white border border-sky-200 px-4 py-2 text-xs sm:text-sm font-bold text-sky-700 hover:bg-sky-50 hover:border-sky-300 transition shadow-xs"
                >
                  <User className="h-4 w-4 text-sky-500" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:from-sky-500 hover:to-sky-700 transition shadow-xs shadow-sky-200"
                >
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}

            <Link
              href="/order-tracking"
              className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 p-2.5 text-white transition shadow-sm shadow-sky-200"
              aria-label="ออเดอร์"
            >
              <ShoppingCart className="h-4 w-4" />
              {activeOrderCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-900 border-2 border-white shadow-xs">
                  {activeOrderCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
