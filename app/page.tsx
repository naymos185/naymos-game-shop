import { GameCategorySection } from '@/components/customer/GameCategorySection';
import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import {
  Zap,
  ShieldCheck,
  Clock,
  Headphones,
  ChevronRight,
  Gamepad2,
  Sparkles,
  Search,
  CheckCircle2,
  Diamond,
  Heart,
} from 'lucide-react';
import { getActiveGames } from '@/lib/games/queries';
import { getActivePromotions } from '@/lib/promotions/queries';
import { getActiveBanners } from '@/lib/banners/queries';

export const dynamic = 'force-dynamic';

const STEPS = [
  { step: '1', title: 'เลือกเกม', desc: 'เลือกเกมที่ต้องการเติม', icon: '1' },
  { step: '2', title: 'เลือกแพ็ก', desc: 'เลือกจำนวนเพชร/คูปอง', icon: '2' },
  { step: '3', title: 'กรอกข้อมูล', desc: 'ใส่ UID / Player ID ของคุณ', icon: '3' },
  { step: '4', title: 'ชำระเงิน', desc: 'สแกน QR PromptPay หรือ TrueMoney', icon: '4' },
  { step: '5', title: 'รับไอเทม', desc: 'ระบบเติมให้อัตโนมัติในไม่กี่นาที', icon: '5' },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'ปลอดภัย 100%',
    desc: 'ไม่ต้องใช้รหัสผ่านเกม ใช้เพียง UID เท่านั้น มั่นใจได้เต็มร้อย',
    badge: '100% Safe',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    icon: Zap,
    title: 'เติมไว ทันใจ',
    desc: 'ระบบอัตโนมัติรวดเร็ว จัดส่งไอเทมทันใจในไม่กี่นาที',
    badge: 'Fast Delivery',
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    icon: Diamond,
    title: 'ราคาคุ้มค่า',
    desc: 'ประหยัดกว่าซื้อเองในเกม พร้อมส่วนลดและโปรโมชั่นสุดพิเศษ',
    badge: 'Best Value',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: Headphones,
    title: 'บริการ 24 ชม.',
    desc: 'มีทีมงานคอยดูแลและช่วยเหลือ ตอบไว แก้ไขทุกปัญหา',
    badge: 'Support 24/7',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
];

export default async function HomePage() {
  const games = await getActiveGames();
  const promotions = await getActivePromotions();
  const banners = await getActiveBanners();

  return (
    <CustomerLayout>
      {/* Hero Section with Official Kawaii Banner Artwork */}
      <section className="relative pt-4 pb-8 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Main Banner Visual Container */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-100 shadow-md bg-white">
                    <div className="relative aspect-[1810/869] w-full overflow-hidden bg-sky-100">
            <picture>
              <source srcSet="/images/banner.webp" type="image/webp" />
              <img
                src="/images/banner.png"
                alt="NayMos GameShop บริการเติมเกมออนไลน์ เติมง่าย สะดวก ปลอดภัย 100%"
                className="w-full h-full object-cover block"
                loading="eager"
              />
            </picture>
          </div>

          {/* Quick Action Overlay for Mobile / Tablet / Desktop */}
          <div className="p-4 sm:p-6 bg-gradient-to-b from-white/90 via-white to-sky-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 p-1 shrink-0 shadow-xs hidden sm:block">
                <img src="/images/logo.webp" alt="NayMos Mascot" className="w-full h-full object-contain" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
                  บริการเติมเกมออนไลน์ <span className="text-sky-500">NayMos GameShop</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  เติมง่าย สะดวก ปลอดภัย 100% ราคาคุ้มค่า ดูแลทุกออเดอร์
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/games"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-700 px-6 py-3 font-bold text-white shadow-sm shadow-sky-200 transition text-sm sm:text-base"
              >
                <Gamepad2 className="h-4 w-4" />
                เริ่มเติมเกม
              </Link>
              <Link
                href="/order-tracking"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white hover:bg-sky-50 border border-sky-200 px-5 py-3 font-semibold text-slate-700 transition text-sm sm:text-base shadow-xs"
              >
                เช็คสถานะ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promoted Banners if configured in Admin */}
      {banners.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {banners.slice(0, 4).map((b) => (
              <Link
                key={b.id}
                href={b.link_url || '/games'}
                className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 hover:border-sky-300 hover:shadow-md transition duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition">{b.title}</p>
                    {b.subtitle && (
                      <p className="text-xs text-slate-500 mt-1">{b.subtitle}</p>
                    )}
                  </div>
                  {b.button_text && (
                    <span className="shrink-0 rounded-full bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1 text-xs font-bold group-hover:bg-sky-500 group-hover:text-white transition">
                      {b.button_text} →
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              โปรโมชันสุดคุ้ม
            </h2>
            <Link href="/promotions" className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {promotions.slice(0, 4).map((pr) => (
              <Link
                key={pr.id}
                href={pr.link_url || '/games'}
                className="rounded-2xl border border-sky-100 bg-white p-4.5 hover:border-sky-300 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {pr.badge && (
                    <span className="rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5">
                      {pr.badge}
                    </span>
                  )}
                  <span className="font-bold text-sm text-slate-800">{pr.title}</span>
                </div>
                {pr.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{pr.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Game Category / Game Cards - Kawaii Micro-interactions */}
      <GameCategorySection games={games} />

      {/* Trust & Features Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2">
            ทำไมต้องเติมกับเรา
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            บริการเติมเกมที่เชื่อถือได้มากที่สุด
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            มั่นใจ ปลอดภัย ดูแลครอบคลุมทุกออเดอร์ตลอด 24 ชั่วโมง
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-sky-100 bg-white p-5 hover:border-sky-200 hover:shadow-md transition duration-200 flex flex-col items-start"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border ${f.color} shadow-xs`}>
                <f.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full mb-1">
                {f.badge}
              </span>
              <h3 className="font-extrabold text-base text-slate-800 mb-1">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Steps to Top-up Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="rounded-3xl bg-white border border-sky-100 p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2">
              ง่ายใน 5 ขั้นตอน
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ขั้นตอนการเติมเกมกับ NayMos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white font-black text-lg flex items-center justify-center mb-3 shadow-md shadow-sky-200">
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold mb-1">
                  ขั้นตอนที่ {s.step}
                </span>
                <h3 className="font-extrabold text-sm text-slate-800 mb-0.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-12">
        <div className="rounded-3xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-lg shadow-sky-200">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              พร้อมเติมเกมกับเราแล้วหรือยัง?
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm mb-6 leading-relaxed">
              สมัครง่าย เติมไว ไม่ต้องใช้รหัสผ่าน พร้อมรับสิทธิ์ราคาพิเศษสำหรับสมาชิก
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/games"
                className="rounded-full bg-white hover:bg-sky-50 text-sky-700 px-8 py-3.5 font-bold text-sm shadow-md transition"
              >
                เริ่มเติมเกมเลย
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-sky-700/40 hover:bg-sky-700/60 border border-white/30 text-white px-6 py-3.5 font-semibold text-sm transition"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}
