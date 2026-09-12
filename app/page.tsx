import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import {
  Zap,
  Shield,
  Clock,
  Headphones,
  ChevronRight,
  Gamepad2,
} from 'lucide-react';
import { MOCK_GAMES } from '@/lib/data/games';

const STEPS = [
  { step: '1', title: 'เลือกเกม', desc: 'เลือกเกมที่ต้องการเติม' },
  { step: '2', title: 'เลือกแพ็ก', desc: 'เลือกจำนวนเพชร/คูปอง' },
  { step: '3', title: 'กรอกข้อมูล', desc: 'ใส่ UID / OpenID ของคุณ' },
  { step: '4', title: 'ชำระเงิน', desc: 'สแกน QR หรือชำระผ่านช่องทางอื่น' },
  { step: '5', title: 'รับไอเทม', desc: 'ระบบเติมให้อัตโนมัติ รวดเร็ว' },
];

const FEATURES = [
  { icon: Zap, title: 'เติมเร็ว', desc: 'ระบบอัตโนมัติ เติมสำเร็จภายในไม่กี่นาที' },
  { icon: Shield, title: 'ปลอดภัย', desc: 'ข้อมูลเข้ารหัส ไม่เก็บรหัสผ่านเกม' },
  { icon: Clock, title: 'เปิด 24 ชม.', desc: 'บริการตลอดเวลา ไม่มีวันหยุด' },
  { icon: Headphones, title: 'ซัพพอร์ตดี', desc: 'ทีมงานพร้อมช่วยเหลือตลอด' },
];

export default function HomePage() {
  return (
    <CustomerLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-red-400 font-semibold text-sm tracking-wide uppercase mb-3">
              ร้านเติมเกมออนไลน์
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              เติมเกม
              <span className="text-red-500"> รวดเร็ว</span>
              <br />
              ปลอดภัย มั่นใจได้
            </h1>
            <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
              NayMos GameShop — เติม Free Fire, RoV, MLBB, Valorant และอีกมากมาย
              ราคาดี ระบบอัตโนมัติ เปิดบริการ 24 ชั่วโมง
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-900/30 transition"
              >
                <Gamepad2 className="h-5 w-5" />
                เลือกเกมที่ต้องการเติม
              </Link>
              <Link
                href="/order-tracking"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-6 py-3.5 font-semibold text-zinc-200 transition"
              >
                ติดตามออเดอร์
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">เกมยอดนิยม</h2>
          <Link href="/games" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
            ดูทั้งหมด <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {MOCK_GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-red-600/50 transition"
            >
              <div className={`aspect-square bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                <Gamepad2 className="h-10 w-10 text-white/80 group-hover:scale-110 transition" />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{game.name}</p>
                <p className="text-xs text-zinc-500">{game.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">ทำไมต้อง NayMos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition">
              <div className="w-10 h-10 rounded-xl bg-red-600/15 flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center">ขั้นตอนการเติมเกม</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative text-center">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {s.step}
              </div>
              <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-zinc-500">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-[60%] w-[80%] h-px bg-zinc-800" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-red-900/40 to-zinc-900 border border-red-900/30 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">พร้อมเติมเกมแล้วหรือยัง?</h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
            ไม่ต้องสมัครสมาชิกก็เติมได้ หรือสมัครเพื่อรับสิทธิพิเศษ คะแนน และประวัติออเดอร์
          </p>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-8 py-3.5 font-bold text-white transition"
          >
            เริ่มเติมเกมเลย
          </Link>
        </div>
      </section>
    </CustomerLayout>
  );
}
