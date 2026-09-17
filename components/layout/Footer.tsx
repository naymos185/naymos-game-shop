import Link from 'next/link';
import { ShieldCheck, Zap, Headphones, Diamond, Heart, MessageCircle, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-white/90 backdrop-blur-md mt-auto">
      {/* Upper kawaii trust bar with clean Lucide icons */}
      <div className="border-b border-sky-100/70 bg-gradient-to-r from-sky-50 via-white to-sky-50 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-around gap-3 sm:gap-4 text-xs font-semibold text-sky-900">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><ShieldCheck className="w-4 h-4" /></span>
            <span className="text-slate-700">ปลอดภัย 100% ไม่ต้องใช้รหัสผ่าน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><Zap className="w-4 h-4" /></span>
            <span className="text-slate-700">เติมไว ทันใจในไม่กี่นาที</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><Diamond className="w-4 h-4" /></span>
            <span className="text-slate-700">ราคาคุ้มค่า ถูกกว่าซื้อเอง</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><Headphones className="w-4 h-4" /></span>
            <span className="text-slate-700">บริการ 24 ชม. พร้อมดูแลทุกเคส</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 p-0.5 overflow-hidden shadow-xs shrink-0">
                <img
                  src="/images/logo.png"
                  alt="NayMos GameShop"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base text-sky-950">
                NayMos <span className="text-sky-500">GameShop</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              ร้านเติมเกมออนไลน์สุดคุ้ม น่ารัก สะดวก ปลอดภัย 100% ดูแลด้วยใจตลอด 24 ชั่วโมง
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition w-fit"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>LINE: @naymosgameshop</span>
              </a>
              <a
                href="https://facebook.com/NayMosGameShop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 transition w-fit"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>NayMosGameShop-บริการเติมเกมออนไลน์</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-sky-950 mb-3">เมนูลัด</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-sky-600 transition">หน้าแรก</Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-sky-600 transition">เกมทั้งหมด</Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-sky-600 transition">โปรโมชั่นพิเศษ</Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-sky-600 transition">ติดตามออเดอร์</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-sky-950 mb-3">ช่วยเหลือ & บริการ</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/how-to" className="hover:text-sky-600 transition">วิธีการเติมเงิน</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-sky-600 transition">คำถามที่พบบ่อย (FAQ)</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-sky-600 transition">ติดต่อฝ่ายสนับสนุน</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-sky-950 mb-3">เวลาทำการ</h4>
            <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-4 space-y-2">
              <p className="text-xs text-sky-950 font-bold">เปิดให้บริการเติมเกม 24 ชั่วโมง</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ทำรายการผ่านระบบหน้าเว็บได้ตลอดเวลา เจ้าหน้าที่จะดำเนินการเติมเงินให้ตามคิวอย่างรวดเร็ว
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ระบบเปิดให้บริการตามปกติ
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line without text collision */}
        <div className="mt-8 pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NayMos GameShop. สงวนลิขสิทธิ์ทุกประการ</p>
          <p className="flex items-center gap-1">
            สร้างด้วย <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> เพื่อชาวเกมเมอร์ทุกคน
          </p>
        </div>
      </div>
    </footer>
  );
}
